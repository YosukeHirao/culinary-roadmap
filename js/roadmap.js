// =============================================
// ロードマップモジュール
// =============================================
const Roadmap = (() => {

  // 5つのフレームワーク定義
  const frameworks = [
    {
      id: 'SSABU',
      name: 'S.S.A.B.U フレームワーク',
      shortName: 'S.S.A.B.U',
      emoji: '👅',
      color: '#e85d4a',
      description: '塩（Salt）・酸（Sour）・香（Aroma）・苦（Bitter）・旨（Umami）の5要素で味を構築する。五感で捉える味覚の設計図。',
      missions: [
        {
          id: 'ssabu_1', required: 30,
          text: '塩（Salt）: 音で塩気を理解する',
          detail: '料理を食べる際に「塩が足りていたか」を声に出して評価し、最適な塩の量を感覚として記録する。塩は他の要素を引き立てる最も基本的な調味料。'
        },
        {
          id: 'ssabu_2', required: 30,
          text: '酸（Sour）: 酸が料理を軽くする原理を体感する',
          detail: 'シチューやソースにレモン汁や白ワインビネガーを加え前後で食べ比べる。酸の添加が「軽さ」と「奥行き」を同時に生む理由を科学的に理解する。'
        },
        {
          id: 'ssabu_3', required: 30,
          text: '香（Aroma）: 香りの層を意識した料理を作る',
          detail: '加熱前・加熱中・仕上げの3段階でそれぞれ異なる香り素材を加える料理を作る。熱による揮発性の違いを理解し、香りの持続時間をコントロールする。'
        },
        {
          id: 'ssabu_4', required: 30,
          text: '苦（Bitter）: 苦味で陰影（Shadow）を作る',
          detail: 'コーヒー・チョコレート・焦がし玉ねぎのいずれかを料理に微量加え、苦味が甘みや旨みの輪郭を際立たせる効果を体感する。苦味は料理に深みと大人っぽさをもたらす。'
        },
        {
          id: 'ssabu_5', required: 30,
          text: '旨（Umami）: 相乗効果を意図的に起こす',
          detail: 'グルタミン酸（昆布・トマト・チーズ）とイノシン酸（かつお・肉）を意図的に組み合わせた料理を作り、単独使用との旨味の差を比較する。'
        }
      ]
    },
    {
      id: 'MGO',
      name: 'M.G.O フレームワーク',
      shortName: 'M.G.O',
      emoji: '🔥',
      color: '#f5a623',
      description: 'メイラード（Maillard）・ゼラチン化（Gelatinization）・浸透圧（Osmosis）の3つの科学反応を意図的にコントロールする。',
      missions: [
        {
          id: 'mgo_1', required: 30,
          text: 'メイラード反応: 表面乾燥の重要性を実証する',
          detail: '同じ肉を「水分あり」と「完全乾燥」の2通りで焼き比べる。乾燥させた方が明らかに濃い焦げ色と香ばしさを持つことを確認し、150°C以上の表面温度が必要な理由を記録する。'
        },
        {
          id: 'mgo_2', required: 30,
          text: 'ゼラチン化: 温度と時間の関係を理解する',
          detail: '豚バラ肉または牛スジを低温（85°C）で3時間と、沸騰（100°C）で1時間の2通りで煮て食べ比べる。低温長時間がコラーゲンをゼラチン化しながら筋繊維を守る理由を実感する。'
        },
        {
          id: 'mgo_3', required: 30,
          text: '浸透圧: 塩のタイミングによる変化を観察する',
          detail: '同じ食材に「焼く30分前」「焼く直前」「焼いた後」に塩をふる3パターンを比較する。浸透圧が水分移動に与える影響と、最適な塩のタイミングを体感する。'
        }
      ]
    },
    {
      id: 'MISE_EN_PLACE',
      name: 'Mise en Place',
      shortName: 'Mise',
      emoji: '📐',
      color: '#7ed321',
      description: 'フランス語で「全てを所定の位置に」。料理前の物理的・精神的準備と時間の同期を徹底することで、調理中の判断ミスをゼロにする。',
      missions: [
        {
          id: 'mise_1', required: 30,
          text: '物理的セットアップ: 調理前に全食材・器具を配置する',
          detail: '料理を始める前に全ての食材を計量・カット済みにし、使う順番で並べる。調理中に「探す・計る・切る」の時間をゼロにすることで、火加減や食材の状態に集中できる環境を作る。'
        },
        {
          id: 'mise_2', required: 30,
          text: '精神的準備: 完成形を描いてから調理を開始する',
          detail: '料理を始める前に、完成した料理の味・見た目・食感を具体的にイメージする。各工程の「目的」を言語化してから作業に入ることで、無意識の手順ミスを防ぐ。'
        },
        {
          id: 'mise_3', required: 30,
          text: '時間の同期: 複数要素が同時に完成するよう逆算する',
          detail: '複数の要素（メイン・ガルニチュール・ソース）を持つ料理で、全てが同時に最適な状態で完成するよう逆算スケジュールを作成して実践する。'
        }
      ]
    },
    {
      id: 'TCS',
      name: '食感のデザイン',
      shortName: 'T.C.S.C',
      emoji: '🧊',
      color: '#4a90e2',
      description: 'テンダー（Tender）・クリスピー（Crispy）・サクレント（Succulent）・コントラスト（Contrast）の食感設計。一皿の中でテクスチャの対比を意図的に作る。',
      missions: [
        {
          id: 'tcs_1', required: 30,
          text: 'Tender: 柔らかさを意図的に作り出す',
          detail: '低温調理（65°C前後）またはブレイジングで、硬い部位を繊維が崩れずジューシーな状態の「柔らかさ」に仕上げる。過調理との違いを明確に理解する。'
        },
        {
          id: 'tcs_2', required: 30,
          text: 'Crispy: 異なる調理法でクリスピーを作る',
          detail: '揚げる・焼く・乾燥させるの3通りの方法で「クリスピー」を作り、それぞれの仕組み（水分除去・デンプンの糊化・タンパク変性）の違いを理解する。'
        },
        {
          id: 'tcs_3', required: 30,
          text: 'Succulent: 肉汁と脂のバランスを理解する',
          detail: '同じ部位を異なる内部温度（60°C・65°C・70°C）で仕上げた肉を比較する。タンパク質の収縮と水分保持の関係から、「ジューシー」の科学的定義を理解する。'
        },
        {
          id: 'tcs_4', required: 30,
          text: 'Contrast: 一皿に対立する食感を意図的に配置する',
          detail: '同じ料理に「柔らかいもの×クリスピーなもの」を意図的に組み合わせ、食感のコントラストが食べる体験をいかに豊かにするかを確認する。'
        }
      ]
    },
    {
      id: 'HLD',
      name: 'H.L.D フレームワーク',
      shortName: 'H.L.D',
      emoji: '🎨',
      color: '#9b59b6',
      description: '高さ（Height）・線（Line）・密度と余白（Density）の3要素で料理の視覚的構成を設計する。食べる前から感動を与えるプレゼンテーション。',
      missions: [
        {
          id: 'hld_1', required: 30,
          text: 'Height（高さ）: 立体的な盛り付けを実践する',
          detail: '平皿に食材を積み上げて高さを作り、「重力への抗い」を視覚で表現する。高さがどのように「手仕事の存在」と「価値の高さ」を無意識に伝えるかを観察する。'
        },
        {
          id: 'hld_2', required: 30,
          text: 'Line（線）: ソースと食材で流れを作る',
          detail: 'ソースを一方向から流したり、食材を一直線に並べたりして料理に「動き」と「方向性」を持たせる。視線誘導の原理を意識した盛り付けを3皿実践する。'
        },
        {
          id: 'hld_3', required: 30,
          text: 'Density（密度）: 余白を意図的に残す',
          detail: '皿の面積の30〜40%を意識的に空白として残す盛り付けを実践する。余白が料理を「図」として際立たせるゲシュタルトの「図と地」原理を体感する。'
        }
      ]
    }
  ];

  /**
   * ミッションの現在カウントを取得する（数値に正規化）
   */
  function getMissionCount(fwProgress, missionId) {
    const val = fwProgress[missionId];
    if (typeof val === 'number') return val;
    if (val === true) return 999; // 旧フォーマット（true）は完了扱い
    return 0;
  }

  /**
   * ミッションが完了しているか判定する
   */
  function isMissionCompleted(fwProgress, mission) {
    return getMissionCount(fwProgress, mission.id) >= (mission.required || 2);
  }

  /**
   * 全ミッション数を返す
   */
  function getTotalMissions() {
    return frameworks.reduce((sum, fw) => sum + fw.missions.length, 0);
  }

  /**
   * 完了済みミッション数を返す
   */
  function getCompletedMissions(progress) {
    let count = 0;
    frameworks.forEach(fw => {
      const fwProgress = progress.frameworks[fw.id] || {};
      fw.missions.forEach(m => {
        if (isMissionCompleted(fwProgress, m)) count++;
      });
    });
    return count;
  }

  /**
   * フレームワーク単体の達成率（%）を返す（途中カウントも比例反映）
   */
  function getFrameworkPercent(fwId, progress) {
    const fw = frameworks.find(f => f.id === fwId);
    if (!fw || fw.missions.length === 0) return 0;
    const fwProgress = progress.frameworks[fwId] || {};
    const total = fw.missions.reduce((sum, m) => {
      const req = m.required || 2;
      const cnt = Math.min(getMissionCount(fwProgress, m.id), req);
      return sum + cnt / req;
    }, 0);
    return Math.round((total / fw.missions.length) * 100);
  }

  /**
   * レシピスタンプ時に関連フレームワークのミッションを1段階進める
   * 各フレームワークの「最初の未完了ミッション」に +1 カウント
   */
  function incrementMissionsForFrameworks(frameworkIds) {
    if (!frameworkIds || frameworkIds.length === 0) return;
    const progress = Storage.getProgress();
    let changed = false;

    frameworkIds.forEach(fwId => {
      const fw = frameworks.find(f => f.id === fwId);
      if (!fw) return;
      if (!progress.frameworks[fwId]) progress.frameworks[fwId] = {};
      const fwProgress = progress.frameworks[fwId];

      // 最初の未完了ミッションを探して +1
      const target = fw.missions.find(m => !isMissionCompleted(fwProgress, m));
      if (target) {
        const current = getMissionCount(fwProgress, target.id);
        fwProgress[target.id] = current + 1;
        changed = true;
      }
    });

    if (changed) {
      Storage.saveProgress(progress);
      App.updateOverallProgress();
      App.renderFrameworkCards();
      Recipe.checkUnlocks();
    }
  }

  /**
   * スタンプ取り消し時に関連フレームワークのミッションを1段階戻す
   * incrementMissionsForFrameworks と同じ対象ミッション（最初の未完了）に -1 カウント
   */
  function decrementMissionsForFrameworks(frameworkIds) {
    if (!frameworkIds || frameworkIds.length === 0) return;
    const progress = Storage.getProgress();
    let changed = false;

    frameworkIds.forEach(fwId => {
      const fw = frameworks.find(f => f.id === fwId);
      if (!fw) return;
      if (!progress.frameworks[fwId]) return;
      const fwProgress = progress.frameworks[fwId];

      // increment と同じ対象（最初の未完了ミッション）を -1
      const target = fw.missions.find(m => !isMissionCompleted(fwProgress, m));
      if (target) {
        const current = getMissionCount(fwProgress, target.id);
        if (current > 0) {
          fwProgress[target.id] = current - 1;
          changed = true;
        }
      }
    });

    if (changed) {
      Storage.saveProgress(progress);
      App.updateOverallProgress();
      App.renderFrameworkCards();
    }
  }

  /**
   * フレームワーク配列を返す（外部参照用）
   */
  function getFrameworks() {
    return frameworks;
  }

  /**
   * ロードマップビュー初期化
   */
  function initView() {
    renderFrameworkList();
  }

  /**
   * フレームワーク一覧を描画する
   */
  function renderFrameworkList() {
    const container = document.getElementById('framework-list');
    if (!container) return;

    const progress = Storage.getProgress();

    container.innerHTML = frameworks.map(fw => {
      const percent = getFrameworkPercent(fw.id, progress);
      const fwProgress = progress.frameworks[fw.id] || {};
      const completedCount = fw.missions.filter(m => fwProgress[m.id]).length;

      return `
        <div class="fw-list-card" style="--fw-color: ${fw.color}" onclick="Roadmap.showDetail('${fw.id}')">
          <div class="fw-list-header">
            <span class="fw-list-emoji">${fw.emoji}</span>
            <div class="fw-list-info">
              <div class="fw-list-name">${fw.name}</div>
              <div class="fw-list-shortname">${fw.shortName}</div>
            </div>
            <span class="fw-list-percent">${percent}%</span>
          </div>
          <div class="fw-list-bar-wrap">
            <div class="fw-list-bar">
              <div class="fw-list-fill" style="width:${percent}%"></div>
            </div>
          </div>
          <div class="fw-list-desc">${fw.description}</div>
          <div class="fw-list-meta">
            <span class="fw-list-mission-count">ミッション ${completedCount}/${fw.missions.length} 完了</span>
            <span class="fw-list-arrow">→</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * フレームワーク詳細ビューに遷移する
   */
  function showDetail(fwId) {
    // タブメモリに記録（他タブから戻ったとき詳細を復元する）
    App.setTabMemory('roadmap', () => Roadmap.showDetail(fwId));
    App.navigate('framework-detail');
    renderFrameworkDetail(fwId);
  }

  /**
   * フレームワーク詳細を描画する
   */
  function renderFrameworkDetail(fwId) {
    const fw = frameworks.find(f => f.id === fwId);
    if (!fw) return;

    const progress = Storage.getProgress();
    const fwProgress = progress.frameworks[fwId] || {};
    const percent = getFrameworkPercent(fwId, progress);
    const completedCount = fw.missions.filter(m => fwProgress[m.id]).length;

    // タイトル
    const titleEl = document.getElementById('fw-detail-title');
    if (titleEl) titleEl.textContent = `${fw.emoji} ${fw.name}`;

    // コンテンツ
    const contentEl = document.getElementById('fw-detail-content');
    if (!contentEl) return;

    const missionsHTML = fw.missions.map(mission => {
      const req = mission.required || 30;
      const cnt = Math.min(getMissionCount(fwProgress, mission.id), req);
      const isCompleted = cnt >= req;
      const pct = req > 0 ? Math.round((cnt / req) * 100) : 0;
      return `
        <div class="mission-item ${isCompleted ? 'completed' : cnt > 0 ? 'in-progress' : ''}" id="mission-item-${mission.id}">
          <div class="mission-text-wrap">
            <div class="mission-text">${mission.text}</div>
            <div class="mission-detail">${mission.detail}</div>
            <div class="mission-progress-row">
              <div class="mission-progress-mini">
                <div class="mission-progress-mini-fill" style="width:${pct}%"></div>
              </div>
              <span class="mission-progress-count">${isCompleted ? '✅ 習得済み' : `${cnt} / ${req}`}</span>
            </div>
          </div>
          <button class="mission-manual-btn" onclick="Roadmap.toggleMission('${fwId}', '${mission.id}', ${!isCompleted})" title="${isCompleted ? 'リセット' : '習得済みにする'}">
            ${isCompleted ? '↩' : '✓'}
          </button>
        </div>
      `;
    }).join('');

    contentEl.innerHTML = `
      <div class="fw-detail-hero" style="background: linear-gradient(135deg, ${fw.color}22, ${fw.color}08); border: 1px solid ${fw.color}33;">
        <div class="fw-detail-hero-emoji">${fw.emoji}</div>
        <div class="fw-detail-hero-name">${fw.name}</div>
        <div class="fw-detail-hero-desc">${fw.description}</div>
        <div class="fw-detail-progress-label">
          <span>進捗</span>
          <span id="fw-detail-percent">${completedCount}/${fw.missions.length} 完了</span>
        </div>
        <div class="fw-detail-progress-bar">
          <div class="fw-detail-progress-fill" id="fw-detail-progress-fill" style="width:${percent}%;background:${fw.color}"></div>
        </div>
      </div>
      <div class="fw-missions-title">ミッション一覧</div>
      <div class="fw-missions-list" id="fw-missions-list">
        ${missionsHTML}
      </div>
    `;
  }

  /**
   * ミッションを手動で完了 or リセットする
   * complete=true → カウントを required に設定（即完了）
   * complete=false → カウントを 0 にリセット
   */
  function toggleMission(fwId, missionId, complete) {
    const progress = Storage.getProgress();
    if (!progress.frameworks[fwId]) progress.frameworks[fwId] = {};
    const fw = frameworks.find(f => f.id === fwId);
    const mission = fw?.missions.find(m => m.id === missionId);
    if (!mission) return;

    progress.frameworks[fwId][missionId] = complete ? (mission.required || 2) : 0;
    Storage.saveProgress(progress);

    // 詳細ビューを再描画
    renderFrameworkDetail(fwId);

    // ホーム・進捗を更新
    App.updateOverallProgress();
    App.renderFrameworkCards();
    Recipe.checkUnlocks();
  }

  return {
    getTotalMissions,
    getCompletedMissions,
    getFrameworkPercent,
    getFrameworks,
    initView,
    showDetail,
    toggleMission,
    incrementMissionsForFrameworks,
    decrementMissionsForFrameworks,
  };
})();
