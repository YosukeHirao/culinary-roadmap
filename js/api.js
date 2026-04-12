// =============================================
// API・レシピ生成モジュール
// =============================================
const Api = (() => {

  const API_KEY_STORAGE = 'CULINARY_API_KEY';

  // 生成中フラグ
  let isGenerating = false;
  // 現在の生成結果（保存前のコンテンツ）
  let currentGeneratedContent = null;
  // 現在の生成に使用した食材・スタイル
  let currentIngredients = '';
  let currentStyle = '';

  /**
   * AI生成ビュー初期化
   */
  function initView() {
    renderFrameworkCheckboxes();
    renderGeneratedHistory();

    // 保存済みAPIキーを復元
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) {
      const keyInput = document.getElementById('api-key-input');
      if (keyInput) keyInput.value = savedKey;
    }

    // 結果エリアをリセット
    const resultEl = document.getElementById('ai-result');
    if (resultEl) resultEl.classList.add('hidden');
  }

  /**
   * フレームワーク選択チェックボックスを描画する
   */
  function renderFrameworkCheckboxes() {
    const container = document.getElementById('fw-checkboxes');
    if (!container) return;

    const frameworks = Roadmap.getFrameworks();

    container.innerHTML = frameworks.map(fw => `
      <label class="fw-checkbox-item fw-checked" data-fw-id="${fw.id}">
        <input
          type="checkbox"
          class="fw-checkbox-native"
          value="${fw.id}"
          checked
          onchange="Api._onCheckboxChange(this)"
        >
        <div class="fw-checkbox-custom">✓</div>
        <div class="fw-checkbox-label">
          <span class="fw-checkbox-emoji">${fw.emoji}</span>
          <span>${fw.shortName} — ${fw.name.replace(fw.shortName, '').trim()}</span>
        </div>
      </label>
    `).join('');
  }

  /**
   * チェックボックス変更時の見た目更新（内部用）
   */
  function _onCheckboxChange(input) {
    const label = input.closest('.fw-checkbox-item');
    const custom = label.querySelector('.fw-checkbox-custom');
    if (input.checked) {
      label.classList.add('fw-checked');
      custom.textContent = '✓';
    } else {
      label.classList.remove('fw-checked');
      custom.textContent = '';
    }
  }

  /**
   * 選択されているフレームワークIDの配列を返す
   */
  function getSelectedFrameworks() {
    const checkboxes = document.querySelectorAll('#fw-checkboxes .fw-checkbox-native:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * レシピ生成メインロジック
   */
  async function generateRecipe() {
    if (isGenerating) return;

    const apiKeyInput = document.getElementById('api-key-input');
    const ingredientsInput = document.getElementById('ai-ingredients');
    const styleInput = document.getElementById('ai-style');
    const btn = document.getElementById('generate-btn');
    const btnText = document.getElementById('generate-btn-text');
    const resultEl = document.getElementById('ai-result');

    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
    const ingredients = ingredientsInput ? ingredientsInput.value.trim() : '';
    const style = styleInput ? styleInput.value.trim() : '';

    // バリデーション
    if (!apiKey) {
      showError('APIキーを入力してください。');
      return;
    }
    if (!apiKey.startsWith('sk-ant-')) {
      showError('有効なAnthropicのAPIキーを入力してください（sk-ant- で始まる文字列）。');
      return;
    }
    if (!ingredients) {
      showError('使用する食材を入力してください。');
      return;
    }

    // APIキーをlocalStorageに保存
    localStorage.setItem(API_KEY_STORAGE, apiKey);

    const selectedFrameworks = getSelectedFrameworks();
    const prompt = buildPrompt(ingredients, style, selectedFrameworks);

    // UI: ローディング状態
    isGenerating = true;
    currentGeneratedContent = null;
    currentIngredients = ingredients;
    currentStyle = style;

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = '⏳ 生成中...';

    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="ai-result-card">
          <div class="ai-loading">
            <div class="ai-loading-spinner"></div>
            <div class="ai-loading-text">Claudeがレシピを考案しています...</div>
          </div>
        </div>
      `;
    }

    try {
      const text = await callClaudeApi(prompt, apiKey);
      currentGeneratedContent = text;

      if (resultEl) {
        resultEl.innerHTML = `
          <div class="ai-result-card">
            <div class="ai-result-header">✨ 生成されたレシピ</div>
            <div class="ai-result-content" id="ai-result-content">
              ${formatRecipeText(text)}
            </div>
            <button class="ai-save-btn" id="ai-save-btn" onclick="Api.saveCurrentRecipe()">
              💾 このレシピを保存する
            </button>
          </div>
        `;
      }
    } catch (err) {
      console.error('API呼び出しエラー:', err);
      if (resultEl) {
        resultEl.innerHTML = `
          <div class="ai-result-card">
            <div class="ai-error">
              ❌ エラーが発生しました。<br>
              ${escapeHtml(err.message || String(err))}
            </div>
          </div>
        `;
      }
    } finally {
      isGenerating = false;
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = '✨ レシピを生成する';
    }
  }

  /**
   * エラーメッセージを表示する
   */
  function showError(message) {
    const resultEl = document.getElementById('ai-result');
    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="ai-result-card">
          <div class="ai-error">⚠️ ${escapeHtml(message)}</div>
        </div>
      `;
    }
  }

  /**
   * プロンプトを組み立てる
   */
  function buildPrompt(ingredients, style, frameworkIds) {
    const frameworks = Roadmap.getFrameworks();
    const selectedFws = frameworks.filter(fw => frameworkIds.includes(fw.id));

    const fwDescriptions = selectedFws.map(fw => {
      return `【${fw.shortName}】${fw.description}`;
    }).join('\n');

    const styleText = style ? `料理のスタイル・コンセプト: ${style}` : '';

    return `あなたはプロの料理研究家です。以下の条件でレシピを考案してください。

## 使用食材
${ingredients}

${styleText}

## 適用するフレームワーク
${fwDescriptions || '（なし）'}

## 出力形式
以下の構成でMarkdown形式でレシピを作成してください：

# （料理名をここに記載）

## 概要
（料理のコンセプトと特徴を2〜3文で）

## 食材リスト
- 食材名: 分量
（全食材をリストアップ）

## 調理工程
### Step 1: （工程名）
（詳細な手順）

**科学的解説:** （この工程で起きている化学・物理的変化）

### Step 2: （工程名）
（詳細な手順）

**科学的解説:** （この工程で起きている化学・物理的変化）

（必要なだけ工程を続ける）

## フレームワーク活用ポイント
${selectedFws.length > 0 ? selectedFws.map(fw => `### ${fw.emoji} ${fw.shortName}\n（このレシピでの${fw.shortName}の活用方法）`).join('\n\n') : '（フレームワーク未選択）'}

## 盛り付けとプレゼンテーション
（視覚的な仕上げ方）

最後に、以下の形式でタグを出力してください（本文の末尾に追記）：

---TAGS---
ジャンル: （和食／フレンチ／イタリアン／中華／洋食／アジア／アメリカン のいずれか1〜2つ）
調理法: （焼き／煮込み／揚げ／蒸し／炒め／和え／生／低温調理 のいずれか1〜2つ）
食材: （肉料理／魚料理／野菜／卵料理／パスタ・米／スープ のいずれか1〜2つ）

日本語で丁寧に記述してください。科学的な根拠を重視した内容にしてください。`;
  }

  /**
   * Claude APIを呼び出す
   */
  async function callClaudeApi(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      let errMsg = `APIエラー: ${response.status}`;
      try {
        const errData = await response.json();
        if (errData.error && errData.error.message) {
          errMsg = errData.error.message;
        }
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('レスポンスの形式が想定外です。');
    }

    return data.content[0].text;
  }

  /**
   * 現在の生成結果をlocalStorageに保存する
   */
  function saveCurrentRecipe() {
    if (!currentGeneratedContent) return;

    const recipesState = Storage.getRecipes();
    if (!recipesState.generated) recipesState.generated = [];

    // ---TAGS--- セクションを本文から分離する
    const tagSplit = currentGeneratedContent.split(/\n---TAGS---\n/);
    const mainContent = tagSplit[0].trim();
    const tagSection = tagSplit[1] || '';

    // タグをパースする（ジャンル: フレンチ,洋食 などの形式）
    function parseTagLine(section, label) {
      const m = section.match(new RegExp(`${label}:\\s*(.+)`));
      if (!m) return [];
      return m[1].split(/[,、／]/).map(t => t.trim()).filter(Boolean);
    }
    const parsedTags = {
      genre:      parseTagLine(tagSection, 'ジャンル'),
      method:     parseTagLine(tagSection, '調理法'),
      ingredient: parseTagLine(tagSection, '食材'),
    };

    // タイトルを本文から抽出する（先頭の # 見出し）
    const titleMatch = mainContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : `生成レシピ ${new Date().toLocaleDateString('ja-JP')}`;

    const newRecipe = {
      id: `generated_${Date.now()}`,
      title: title,
      subtitle: [currentStyle, currentIngredients].filter(Boolean).join(' · '),
      thumbnail: '✨',
      time: null,
      servings: null,
      frameworks: getSelectedFrameworks(),
      tags: parsedTags,
      content: mainContent,
      ingredients: currentIngredients,
      style: currentStyle,
      createdAt: new Date().toISOString()
    };

    recipesState.generated.unshift(newRecipe);
    Storage.saveRecipes(recipesState);

    // 保存ボタンを更新
    const saveBtn = document.getElementById('ai-save-btn');
    if (saveBtn) {
      saveBtn.textContent = '✅ 保存しました';
      saveBtn.classList.add('saved');
      saveBtn.disabled = true;
    }

    // 履歴を更新
    renderGeneratedHistory();
  }

  /**
   * 生成済みレシピ履歴を描画する
   */
  function renderGeneratedHistory() {
    const container = document.getElementById('generated-history');
    if (!container) return;

    const recipesState = Storage.getRecipes();
    const generated = recipesState.generated || [];

    if (generated.length === 0) {
      container.innerHTML = '<div class="generated-empty">まだ生成されたレシピはありません</div>';
      return;
    }

    container.innerHTML = generated.map(recipe => {
      const date = recipe.createdAt
        ? new Date(recipe.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
      return `
        <div class="generated-history-item" onclick="Recipe.showDetail('${recipe.id}', true)">
          <div class="generated-history-title">${escapeHtml(recipe.title)}</div>
          <div class="generated-history-meta">
            ${recipe.ingredients ? escapeHtml(recipe.ingredients) : ''}
            ${date ? ` · ${date}` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * マークダウンをHTMLに変換する
   */
  function formatRecipeText(text) {
    if (!text) return '';

    return text
      // エスケープ
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 見出し
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      // 太字
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // リスト
      .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')
      // 連続する li を ul で囲む
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // 連続する空行をpタグに
      .split('\n\n')
      .map(block => {
        block = block.trim();
        if (!block) return '';
        if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<li')) {
          return block;
        }
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  }

  /**
   * HTML特殊文字のエスケープ
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    initView,
    generateRecipe,
    saveCurrentRecipe,
    renderGeneratedHistory,
    formatRecipeText,
    _onCheckboxChange
  };
})();
