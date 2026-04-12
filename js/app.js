// =============================================
// ストレージ管理モジュール
// =============================================
const Storage = (() => {
  const PROGRESS_KEY = 'CULINARY_PROGRESS';
  const RECIPES_KEY = 'CULINARY_RECIPES';

  function getProgress() {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : { frameworks: {} };
    } catch {
      return { frameworks: {} };
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  function getRecipes() {
    try {
      const data = localStorage.getItem(RECIPES_KEY);
      return data ? JSON.parse(data) : { unlockedIds: [], stampedIds: [], generated: [] };
    } catch {
      return { unlockedIds: [], stampedIds: [], generated: [] };
    }
  }

  function saveRecipes(recipes) {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  }

  return { getProgress, saveProgress, getRecipes, saveRecipes };
})();

// =============================================
// アプリ全体制御モジュール
// =============================================
const App = (() => {
  let currentView = 'home';
  const scrollPositions = {};
  const tabMemory = {}; // タブごとの最後の状態（復元関数）を記憶
  // スクロール位置を保持するメインタブ
  const MAIN_VIEWS = new Set(['home', 'roadmap', 'recipes', 'ai-generate']);
  // サブビューから親タブナビへのマッピング
  const SUB_VIEW_PARENT = { 'recipe-detail': 'recipes', 'framework-detail': 'roadmap' };

  /**
   * 指定ビューに遷移する
   */
  function navigate(viewId, params = {}) {
    // メインタブのスクロール位置を保存してから離れる
    if (MAIN_VIEWS.has(currentView)) {
      scrollPositions[currentView] = window.scrollY;
    }

    // 現在のビューを非表示
    const currentEl = document.getElementById(`view-${currentView}`);
    if (currentEl) currentEl.classList.remove('active');

    currentView = viewId;

    // 新しいビューを表示
    const viewEl = document.getElementById(`view-${viewId}`);
    if (viewEl) viewEl.classList.add('active');

    // ボトムナビのアクティブ状態を更新（サブビューは親タブをアクティブに）
    const navTarget = SUB_VIEW_PARENT[viewId] || viewId;
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === navTarget);
    });

    // ビュー別初期化処理（タブメモリがあれば復元、なければ通常初期化）
    const initializers = {
      home: initHomeView,
      roadmap: () => {
        if (tabMemory['roadmap']) { tabMemory['roadmap'](); }
        else { Roadmap.initView(); }
      },
      recipes: () => {
        if (tabMemory['recipes']) { tabMemory['recipes'](); }
        else { Recipe.initView(); }
      },
      'ai-generate': () => Api.initView(),
    };

    if (initializers[viewId]) {
      initializers[viewId](params);
    }

    // メインタブは保存済み位置に戻す、サブビューはトップへ
    if (MAIN_VIEWS.has(viewId) && scrollPositions[viewId] !== undefined) {
      requestAnimationFrame(() => window.scrollTo(0, scrollPositions[viewId]));
    } else {
      window.scrollTo(0, 0);
    }
  }

  /**
   * ホームビューの初期化
   */
  function initHomeView() {
    updateOverallProgress();
    renderFrameworkCards();
  }

  /**
   * 総合習熟度バーを更新する
   */
  function updateOverallProgress() {
    const progress = Storage.getProgress();
    const total = Roadmap.getTotalMissions();
    const completed = Roadmap.getCompletedMissions(progress);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const percentEl = document.getElementById('overall-percent');
    const fillEl = document.getElementById('overall-progress-fill');

    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
  }

  /**
   * ホーム画面のフレームワークミニカードを描画する
   */
  function renderFrameworkCards() {
    const container = document.getElementById('framework-cards');
    if (!container) return;

    const progress = Storage.getProgress();
    const frameworks = Roadmap.getFrameworks();

    container.innerHTML = frameworks.map(fw => {
      const percent = Roadmap.getFrameworkPercent(fw.id, progress);
      return `
        <div class="framework-mini-card" onclick="Roadmap.showDetail('${fw.id}')">
          <div class="fw-mini-header">
            <span class="fw-mini-emoji">${fw.emoji}</span>
            <span class="fw-mini-name">${fw.shortName}</span>
          </div>
          <div class="fw-mini-bar">
            <div class="fw-mini-fill" style="width:${percent}%;background:${fw.color}"></div>
          </div>
          <span class="fw-mini-percent">${percent}%</span>
        </div>
      `;
    }).join('');
  }

  /**
   * アプリ初期化
   */
  function init() {
    // ナビゲーションボタンのイベント登録
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.view));
    });

    // 保存済みAPIキーをアプリ起動時に復元
    const savedKey = localStorage.getItem('CULINARY_API_KEY');
    if (savedKey) {
      const keyInput = document.getElementById('api-key-input');
      if (keyInput) keyInput.value = savedKey;
    }

    // ホームから起動
    navigate('home');
  }

  /**
   * タブの状態を記憶する（サブビューへの遷移時に呼び出す）
   */
  function setTabMemory(tab, fn) {
    tabMemory[tab] = fn;
  }

  /**
   * バックボタン用ナビゲーション：タブメモリをクリアしてリスト表示
   */
  function navigateBack(tab) {
    tabMemory[tab] = null;
    navigate(tab);
  }

  return { navigate, navigateBack, setTabMemory, init, updateOverallProgress, renderFrameworkCards };
})();

// DOMContentLoaded でアプリ起動
document.addEventListener('DOMContentLoaded', () => App.init());
