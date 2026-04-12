// =============================================
// レシピモジュール
// =============================================
const Recipe = (() => {

  // レシピデータのキャッシュ
  let recipesData = null;

  // フィルター状態
  let filterState = {
    search: '',
    genre: [],
    method: [],
    ingredient: [],
    stampedOnly: false,
  };

  // タグの選択肢マスター
  const TAG_OPTIONS = {
    genre:      ['和食', 'フレンチ', 'イタリアン', '中華', '洋食', 'アジア', 'アメリカン'],
    method:     ['焼き', '煮込み', '揚げ', '蒸し', '炒め', '和え', '生', '低温調理'],
    ingredient: ['肉料理', '魚料理', '野菜', '卵料理', 'パスタ・米', 'スープ'],
  };

  /**
   * レシピJSONを取得・キャッシュする
   */
  async function loadData() {
    if (recipesData) return recipesData;
    try {
      const res = await fetch('data/recipes.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      recipesData = json;
      return recipesData;
    } catch (err) {
      console.error('レシピデータの読み込みに失敗しました:', err);
      return null;
    }
  }

  /**
   * レシピビュー初期化
   */
  async function initView() {
    await loadData();
    migrateGeneratedRecipes();
    renderRecipeList();
  }

  /**
   * 既存のAI生成レシピを修正する（旧フォーマット対応）
   * - "生成レシピ 年/月/日" → 本文の # 見出しからタイトルを抽出
   * - tags フィールドがなければ空オブジェクトを追加
   */
  function migrateGeneratedRecipes() {
    const recipesState = Storage.getRecipes();
    let changed = false;

    (recipesState.generated || []).forEach(recipe => {
      // タイトルが自動生成された形式なら本文から抽出を試みる
      if (recipe.title && /^生成レシピ /.test(recipe.title) && recipe.content) {
        const match = recipe.content.match(/^#\s+(.+)/m);
        if (match) {
          recipe.title = match[1].trim();
          changed = true;
        }
      }
      // tags がなければ空オブジェクトを付与
      if (!recipe.tags) {
        recipe.tags = { genre: [], method: [], ingredient: [] };
        changed = true;
      }
    });

    if (changed) Storage.saveRecipes(recipesState);
  }

  /**
   * ミッション完了数に応じてレシピをアンロックする
   */
  async function checkUnlocks() {
    if (!recipesData) return;

    const progress = Storage.getProgress();
    const completedCount = Roadmap.getCompletedMissions(progress);
    const recipesState = Storage.getRecipes();

    let updated = false;
    recipesData.recipes.forEach(recipe => {
      if (
        completedCount >= recipe.requiredMissions &&
        !recipesState.unlockedIds.includes(recipe.id)
      ) {
        recipesState.unlockedIds.push(recipe.id);
        updated = true;
      }
    });

    if (updated) {
      Storage.saveRecipes(recipesState);
      // レシピビューが表示中なら結果エリアのみ更新
      const recipeView = document.getElementById('view-recipes');
      if (recipeView && recipeView.classList.contains('active')) {
        updateRecipeResults();
      }
    }
  }

  /**
   * トースト通知を表示する
   */
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * レシピ一覧を描画する（フィルターバー初期化 + 結果更新）
   */
  function renderRecipeList() {
    setupFilterBar();
    updateRecipeResults();
  }

  /**
   * フィルターバーを初回のみ作成する（2回目以降はスキップ）
   * これにより input 要素が再生成されず、フォーカスが維持される
   */
  function setupFilterBar() {
    const container = document.getElementById('recipe-list');
    if (!container) return;
    if (document.getElementById('recipe-filter-bar')) return;

    const recipesState = Storage.getRecipes();
    const allBuiltin = (recipesData?.recipes || []).map(r => ({ ...r, _isGenerated: false }));
    const allGenerated = (recipesState.generated || []).map(r => ({ ...r, _isGenerated: true }));
    const allRecipes = [...allBuiltin, ...allGenerated];

    container.innerHTML = `
      <div id="recipe-filter-bar">${renderFilterBarHTML(allRecipes)}</div>
      <div id="recipe-results"></div>
    `;
  }

  /**
   * フィルターバーのHTML文字列を生成する（初回作成時のみ使用）
   */
  function renderFilterBarHTML(allRecipes) {
    function countTag(category, value) {
      return allRecipes.filter(r => (r.tags?.[category] || []).includes(value)).length;
    }
    function chipGroup(category, label) {
      const options = TAG_OPTIONS[category];
      const chips = options.map(val => {
        const count = countTag(category, val);
        if (count === 0) return '';
        const active = filterState[category].includes(val) ? 'active' : '';
        return `<button class="filter-chip ${active}" data-category="${category}" data-value="${escapeHtml(val)}" onclick="Recipe.toggleFilter('${category}','${val}')">${val} <span class="chip-count">${count}</span></button>`;
      }).join('');
      return chips ? `<div class="filter-group"><span class="filter-group-label">${label}</span><div class="filter-chips">${chips}</div></div>` : '';
    }

    return `
      <div class="filter-bar">
        <div class="filter-search-wrap">
          <input
            class="filter-search"
            type="search"
            placeholder="🔍 レシピ名・食材で検索"
            value="${escapeHtml(filterState.search)}"
            oninput="Recipe.onSearchInput(this.value)"
          />
          <button class="filter-clear-btn" style="display:none" onclick="Recipe.clearFilter()">✕ クリア</button>
        </div>
        <div class="filter-group">
          <span class="filter-group-label">状態</span>
          <div class="filter-chips">
            <button class="filter-chip ${filterState.stampedOnly ? 'active' : ''}" id="filter-stamped-btn" onclick="Recipe.toggleStampedFilter()">✓ 作った済み</button>
          </div>
        </div>
        ${chipGroup('genre', 'ジャンル')}
        ${chipGroup('method', '調理法')}
        ${chipGroup('ingredient', '食材')}
      </div>
    `;
  }

  /**
   * レシピ結果エリアのみを更新する（フィルターバーは触らない）
   */
  function updateRecipeResults() {
    const resultsEl = document.getElementById('recipe-results');
    if (!resultsEl) return;

    const recipesState = Storage.getRecipes();
    const allBuiltin = (recipesData?.recipes || []).map(r => ({ ...r, _isGenerated: false }));
    const allGenerated = (recipesState.generated || []).map(r => ({ ...r, _isGenerated: true }));
    const allRecipes = [...allBuiltin, ...allGenerated];
    const filtered = applyFilter(allRecipes, recipesState);

    let html = '';
    if (filtered.length === 0) {
      html = `<div class="filter-empty">条件に合うレシピが見つかりませんでした</div>`;
    } else {
      const builtinFiltered = filtered.filter(r => !r._isGenerated);
      if (builtinFiltered.length > 0) {
        html += '<div class="recipe-section-title">収録レシピ</div>';
        html += builtinFiltered.map(recipe => {
          const isStamped = recipesState.stampedIds.includes(recipe.id);
          return renderRecipeCard(recipe, true, isStamped, false);
        }).join('');
      }
      const generatedFiltered = filtered.filter(r => r._isGenerated);
      if (generatedFiltered.length > 0) {
        html += '<div class="recipe-section-title" style="margin-top:20px">AI生成レシピ</div>';
        html += generatedFiltered.map(recipe => {
          const isStamped = recipesState.stampedIds.includes(recipe.id);
          return renderRecipeCard(recipe, true, isStamped, true);
        }).join('');
      }
    }
    resultsEl.innerHTML = html;
  }

  /**
   * フィルターバーのUI状態（チップ・クリアボタン）だけを更新する
   */
  function updateFilterBarUI() {
    document.querySelectorAll('.filter-chip[data-category]').forEach(chip => {
      const category = chip.dataset.category;
      const value = chip.dataset.value;
      chip.classList.toggle('active', filterState[category]?.includes(value) || false);
    });
    const stampedBtn = document.getElementById('filter-stamped-btn');
    if (stampedBtn) stampedBtn.classList.toggle('active', filterState.stampedOnly);

    const hasActive = filterState.search || filterState.genre.length || filterState.method.length || filterState.ingredient.length || filterState.stampedOnly;
    const clearBtn = document.querySelector('.filter-clear-btn');
    if (clearBtn) clearBtn.style.display = hasActive ? '' : 'none';
  }

  /**
   * フィルターを適用して絞り込んだレシピ配列を返す
   */
  function applyFilter(recipes, recipesState) {
    return recipes.filter(recipe => {
      // 作った済みフィルター
      if (filterState.stampedOnly) {
        if (!recipesState.stampedIds.includes(recipe.id)) return false;
      }
      // テキスト検索（タイトル・サブタイトル・食材名）
      if (filterState.search) {
        const q = filterState.search.toLowerCase();
        const ingredientNames = (recipe.ingredients || []).map(i => i.name || i).join(' ');
        const searchTarget = [recipe.title, recipe.subtitle, ingredientNames]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchTarget.includes(q)) return false;
      }
      // タグフィルター（カテゴリをまたいでAND、カテゴリ内はOR）
      for (const category of ['genre', 'method', 'ingredient']) {
        const selected = filterState[category];
        if (selected.length === 0) continue;
        const recipeTags = recipe.tags?.[category] || [];
        if (recipeTags.length === 0) continue;
        if (!selected.some(s => recipeTags.includes(s))) return false;
      }
      return true;
    });
  }

  /**
   * テキスト検索の入力ハンドラ
   */
  function onSearchInput(value) {
    filterState.search = value;
    updateRecipeResults();
    updateFilterBarUI();
  }

  /**
   * フィルターチップのトグル
   */
  function toggleFilter(category, value) {
    const arr = filterState[category];
    const idx = arr.indexOf(value);
    if (idx === -1) arr.push(value);
    else arr.splice(idx, 1);
    updateRecipeResults();
    updateFilterBarUI();
  }

  /**
   * 「作った済み」フィルターのトグル
   */
  function toggleStampedFilter() {
    filterState.stampedOnly = !filterState.stampedOnly;
    updateRecipeResults();
    updateFilterBarUI();
  }

  /**
   * フィルターをすべてリセットする
   */
  function clearFilter() {
    filterState = { search: '', genre: [], method: [], ingredient: [], stampedOnly: false };
    const searchInput = document.querySelector('.filter-search');
    if (searchInput) searchInput.value = '';
    updateRecipeResults();
    updateFilterBarUI();
  }

  /**
   * HTMLエスケープ（フィルターバー内で使用）
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * レシピカードのHTMLを生成する
   */
  function renderRecipeCard(recipe, isUnlocked, isStamped, isGenerated) {
    if (!isUnlocked) {
      // ロック状態
      return `
        <div class="recipe-card locked">
          <div class="recipe-thumb">🔒</div>
          <div class="recipe-info">
            <div class="recipe-title" style="filter:blur(4px);user-select:none">${recipe.title}</div>
            <div class="recipe-subtitle" style="filter:blur(3px)">${recipe.subtitle || 'レシピ'}</div>
            <div class="lock-hint">ミッションをさらにクリアして解除</div>
          </div>
        </div>
      `;
    }

    const stampBadge = isStamped ? '<span class="stamp-badge">✓ スタンプ済み</span>' : '';
    const generatedBadge = isGenerated ? '<span class="stamp-badge" style="background:var(--bg-card-2);color:var(--text-muted);border:1px solid var(--border-light)">AI生成</span>' : '';

    return `
      <div class="recipe-card" onclick="Recipe.showDetail('${recipe.id}', ${isGenerated})">
        <div class="recipe-thumb">${recipe.thumbnail || '🍽️'}</div>
        <div class="recipe-info">
          <div class="recipe-title">${recipe.title}</div>
          <div class="recipe-subtitle">${recipe.subtitle || ''}</div>
          <div class="recipe-meta">
            ${recipe.time ? `<span class="recipe-meta-item">⏱ ${recipe.time}</span>` : ''}
            ${recipe.servings ? `<span class="recipe-meta-item">👥 ${recipe.servings}人前</span>` : ''}
          </div>
        </div>
        <div class="recipe-badge-wrap">
          ${stampBadge}
          ${generatedBadge}
        </div>
      </div>
    `;
  }

  /**
   * レシピ詳細ビューを表示する
   */
  async function showDetail(recipeId, isGenerated = false) {
    await loadData();

    let recipe = null;

    if (isGenerated) {
      // AI生成レシピを取得
      const recipesState = Storage.getRecipes();
      recipe = (recipesState.generated || []).find(r => r.id === recipeId);
    } else {
      // 収録レシピを取得
      if (recipesData) {
        recipe = recipesData.recipes.find(r => r.id === recipeId);
      }
    }

    if (!recipe) return;

    // バックボタンの設定（navigateBackでタブメモリをクリアして一覧へ戻る）
    const backBtn = document.getElementById('recipe-back-btn');
    if (backBtn) {
      backBtn.onclick = () => App.navigateBack('recipes');
    }

    // タブメモリに記録（他タブから戻ったとき詳細を復元する）
    App.setTabMemory('recipes', () => Recipe.showDetail(recipeId, isGenerated));

    App.navigate('recipe-detail');
    renderRecipeDetail(recipe, isGenerated);
  }

  /**
   * レシピ詳細を描画する
   */
  function renderRecipeDetail(recipe, isGenerated) {
    const headerEl = document.getElementById('recipe-detail-header');
    const contentEl = document.getElementById('recipe-detail-content');
    if (!headerEl || !contentEl) return;

    const recipesState = Storage.getRecipes();
    const isStamped = recipesState.stampedIds.includes(recipe.id);

    // フレームワークタグ
    const fwTags = (recipe.frameworks || []).map(fw => {
      const fwData = Roadmap.getFrameworks().find(f => f.id === fw);
      if (!fwData) return '';
      return `<span class="recipe-fw-tag" style="border-color:${fwData.color}33;color:${fwData.color}">${fwData.emoji} ${fwData.shortName}</span>`;
    }).join('');

    // ヘッダー
    const editBtn = isGenerated
      ? `<button class="title-edit-btn" onclick="Recipe.startTitleEdit('${recipe.id}')">✏️ 名前を編集</button>`
      : '';

    headerEl.innerHTML = `
      <div class="recipe-detail-header">
        <div class="recipe-detail-thumb">${recipe.thumbnail || '🍽️'}</div>
        <div class="recipe-detail-title" id="detail-title-${recipe.id}">${escapeHtml(recipe.title)}</div>
        ${editBtn}
        <div class="recipe-detail-subtitle">${escapeHtml(recipe.subtitle || '')}</div>
        <div class="recipe-detail-meta">
          ${recipe.time ? `
            <div class="recipe-detail-meta-item">
              <span class="recipe-detail-meta-label">調理時間</span>
              <span class="recipe-detail-meta-value">${recipe.time}</span>
            </div>
          ` : ''}
          ${recipe.servings ? `
            <div class="recipe-detail-meta-item">
              <span class="recipe-detail-meta-label">人数</span>
              <span class="recipe-detail-meta-value">${recipe.servings}人前</span>
            </div>
          ` : ''}
        </div>
        ${fwTags ? `<div class="recipe-frameworks">${fwTags}</div>` : ''}
      </div>
    `;

    // コンテンツ
    let contentHTML = '';

    if (isGenerated && recipe.content) {
      // AI生成レシピ: マークダウンをHTMLに変換
      contentHTML = `
        <div class="ai-recipe-content">
          ${formatMarkdown(recipe.content)}
        </div>
      `;
    } else {
      // 収録レシピ: 食材 + ステップカード
      const ingredientsHTML = (recipe.ingredients || []).map(ing => `
        <li class="ingredient-item">
          <span class="ingredient-name">${ing.name}</span>
          <span class="ingredient-amount">${ing.amount}</span>
        </li>
      `).join('');

      const stepsHTML = (recipe.steps || []).map(step => {
        const fwTags = (step.frameworkLabels || []).map(label =>
          `<span class="step-fw-tag">${label}</span>`
        ).join('');

        const scienceSection = step.science ? `
          <details class="step-science">
            <summary>🔬 科学的解説を見る</summary>
            <div class="step-science-body">
              <p class="step-science-text">${step.science}</p>
              ${step.tips ? `
                <div class="step-tips">
                  <div class="step-tips-label">💡 ポイント</div>
                  <div class="step-tips-text">${step.tips}</div>
                </div>
              ` : ''}
            </div>
          </details>
        ` : '';

        return `
          <div class="step-card">
            <div class="step-header">
              <span class="step-phase-badge">${step.phaseEmoji || ''} ${step.phase}</span>
              <span class="step-number">Step ${step.stepNumber}</span>
            </div>
            <div class="step-title">${step.title}</div>
            ${fwTags ? `<div class="step-fw-tags">${fwTags}</div>` : ''}
            <div class="step-instruction">${step.instruction}</div>
            ${scienceSection}
          </div>
        `;
      }).join('');

      contentHTML = `
        <div class="ingredients-section">
          <div class="ingredients-title">食材</div>
          <ul class="ingredients-list">
            ${ingredientsHTML}
          </ul>
        </div>
        <div class="steps-section">
          <div class="steps-title">調理工程</div>
          ${stepsHTML}
        </div>
      `;
    }

    // スタンプボタン
    const stampBtnHTML = `
      <button
        class="stamp-btn ${isStamped ? 'stamped' : ''}"
        id="stamp-btn-${recipe.id}"
        onclick="Recipe.toggleStamp('${recipe.id}')"
      >
        ${isStamped ? '✓ 作った！（スタンプ済み）' : '⬜ 作った！スタンプを押す'}
      </button>
    `;

    contentEl.innerHTML = contentHTML + stampBtnHTML;
  }

  /**
   * タイトルをインライン編集モードにする
   */
  function startTitleEdit(recipeId) {
    const titleEl = document.getElementById(`detail-title-${recipeId}`);
    const editBtn = document.querySelector('.title-edit-btn');
    if (!titleEl) return;

    const current = titleEl.textContent.trim();
    titleEl.innerHTML = `
      <div class="title-edit-wrap">
        <input class="title-edit-input" id="title-edit-input-${recipeId}"
          type="text" value="${escapeHtml(current)}" maxlength="60" />
        <div class="title-edit-actions">
          <button class="title-save-btn" onclick="Recipe.saveTitleEdit('${recipeId}')">保存</button>
          <button class="title-cancel-btn" onclick="Recipe.cancelTitleEdit('${recipeId}', \`${escapeHtml(current)}\`)">キャンセル</button>
        </div>
      </div>
    `;
    if (editBtn) editBtn.style.display = 'none';
    document.getElementById(`title-edit-input-${recipeId}`)?.focus();
  }

  /**
   * タイトル編集をキャンセルする
   */
  function cancelTitleEdit(recipeId, originalTitle) {
    const titleEl = document.getElementById(`detail-title-${recipeId}`);
    if (titleEl) titleEl.textContent = originalTitle;
    const editBtn = document.querySelector('.title-edit-btn');
    if (editBtn) editBtn.style.display = '';
  }

  /**
   * 編集したタイトルを保存する
   */
  function saveTitleEdit(recipeId) {
    const input = document.getElementById(`title-edit-input-${recipeId}`);
    if (!input) return;
    const newTitle = input.value.trim();
    if (!newTitle) return;

    // localStorageを更新
    const recipesState = Storage.getRecipes();
    const recipe = (recipesState.generated || []).find(r => r.id === recipeId);
    if (recipe) {
      recipe.title = newTitle;
      Storage.saveRecipes(recipesState);
    }

    // タイトルとボタンをUIに反映
    const titleEl = document.getElementById(`detail-title-${recipeId}`);
    if (titleEl) titleEl.textContent = newTitle;
    const editBtn = document.querySelector('.title-edit-btn');
    if (editBtn) editBtn.style.display = '';
  }

  /**
   * スタンプ状態を切り替える
   */
  function toggleStamp(recipeId) {
    const recipesState = Storage.getRecipes();
    const isStamped = recipesState.stampedIds.includes(recipeId);

    if (isStamped) {
      recipesState.stampedIds = recipesState.stampedIds.filter(id => id !== recipeId);
      // スタンプ取り消し時：進めたミッションを1段階戻す
      const recipeForUndo = getRecipeById(recipeId, recipesState);
      if (recipeForUndo?.frameworks?.length) {
        Roadmap.decrementMissionsForFrameworks(recipeForUndo.frameworks);
      }
    } else {
      recipesState.stampedIds.push(recipeId);
      // スタンプ時：レシピのフレームワークに紐づくミッションを1段階進める
      const recipe = getRecipeById(recipeId, recipesState);
      if (recipe?.frameworks?.length) {
        Roadmap.incrementMissionsForFrameworks(recipe.frameworks);
      }
    }

    Storage.saveRecipes(recipesState);

    // ボタンのDOM更新
    const btn = document.getElementById(`stamp-btn-${recipeId}`);
    if (btn) {
      const nowStamped = !isStamped;
      btn.classList.toggle('stamped', nowStamped);
      btn.textContent = nowStamped
        ? '✓ 作った！（スタンプ済み）'
        : '⬜ 作った！スタンプを押す';
    }
  }

  /**
   * IDからレシピオブジェクトを取得する（収録・生成両対応）
   */
  function getRecipeById(recipeId, recipesState) {
    if (recipesData) {
      const builtin = recipesData.recipes.find(r => r.id === recipeId);
      if (builtin) return builtin;
    }
    return (recipesState.generated || []).find(r => r.id === recipeId);
  }

  /**
   * シンプルなマークダウン → HTML変換
   * AI生成レシピのコンテンツ表示用
   */
  function formatMarkdown(text) {
    if (!text) return '';

    return text
      // エスケープ
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // h2, h3, h4
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      // 太字
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // リスト項目
      .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')
      // li をまとめて ul に
      .replace(/(<li>[\s\S]*?<\/li>)(?=\s*<li>|$)/g, match => {
        return match;
      })
      // 連続する li を ul で囲む
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // 空行を段落区切りに
      .replace(/\n\n+/g, '</p><p>')
      // 残りの改行
      .replace(/\n/g, '<br>')
      // p タグで囲む（見出しやリストを除く）
      .replace(/^(?!<[hul]|<\/)(.*)/gm, (match) => {
        if (!match.trim()) return '';
        if (match.startsWith('<')) return match;
        return `<p>${match}</p>`;
      })
      // 空の p を除去
      .replace(/<p><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '');
  }

  return {
    loadData,
    initView,
    checkUnlocks,
    showDetail,
    toggleStamp,
    formatMarkdown,
    onSearchInput,
    toggleFilter,
    toggleStampedFilter,
    clearFilter,
    startTitleEdit,
    cancelTitleEdit,
    saveTitleEdit,
  };
})();
