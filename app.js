// フォームとフォームコントロール用の定数を作成する
const newPeriodFormEl = document.getElementsByTagName("form")[0];
const startDateInputEl = document.getElementById("start-date");
const endDateInputEl = document.getElementById("end-date");
const pastPeriodContainer = document.getElementById("past-periods");

// フォーム送信を待ち受け
newPeriodFormEl.addEventListener("submit", (event) => {
  // すべてをクライアント側で行うため、
  // フォームをサーバーへ送信するのを防ぐ
  event.preventDefault();

  // 開始日と終了日をフォームから取得する
  const startDate = startDateInputEl.value;
  const endDate = endDateInputEl.value;

  // 日付が不正でないかどうか調べる
  if (checkDatesInvalid(startDate, endDate)) {
    // 日付が不正な場合は終了
    return;
  }

  // 新しい期間をクライアント側ストレージに格納する
  storeNewPeriod(startDate, endDate);

  // UI を更新する
  renderPastPeriods();

  // フォームをリセット
  newPeriodFormEl.reset();
});

function checkDatesInvalid(startDate, endDate) {
  // Check that end date is after start date and neither is null.
  if (!startDate || !endDate || startDate > endDate) {
    // To make the validation robust we could:
    // 1. add error messaging based on error type
    // 2. Alert assistive technology users about the error
    // 3. move focus to the error location
    // instead, for now, we clear the dates if either
    // or both are invalid
    newPeriodFormEl.reset();
    // as dates are invalid, we return true
    return true;
  }
  // else
  return false;
}

// ストレージキーをアプリ全体で使用する定数として追加する
const STORAGE_KEY = "period-tracker";

function storeNewPeriod(startDate, endDate) {
  // ストレージからデータを取得する
  const periods = getAllStoredPeriods();

  // 新しい期間オブジェクトを、期間オブジェクトの配列の末尾に追加する
  periods.push({ startDate, endDate });

  // 配列を並べ替えて、期間を開始日が新しいものから古いものの順に並べる
  periods.sort((a, b) => {
    return new Date(b.startDate) - new Date(a.startDate);
  });

  // 更新された配列をストレージに格納する
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
}

function getAllStoredPeriods() {
  // ローカルストレージから期間データの文字列を取得する
  const data = window.localStorage.getItem(STORAGE_KEY);

  // もし何も格納されていなければ、空の配列を返す。
  // そうでなければ、解釈できる JSON として格納されたデータを返す。
  const periods = data ? JSON.parse(data) : [];

  return periods;
}

function renderPastPeriods() {
  // 解釈できる期間の文字列、または空の配列を取得する
  const periods = getAllStoredPeriods();

  // 期間がない場合は終了する
  if (periods.length === 0) {
    return;
  }

  // 過去の期間のリストをクリアする。再レンダリングするため。
  pastPeriodContainer.textContent = "";

  const pastPeriodHeader = document.createElement("h2");
  pastPeriodHeader.textContent = "Past periods";

  const pastPeriodList = document.createElement("ul");

  // すべての期間をループしてレンダリングする。
  periods.forEach((period) => {
    const periodEl = document.createElement("li");
    periodEl.textContent = `From ${formatDate(
      period.startDate,
    )} to ${formatDate(period.endDate)}`;
    pastPeriodList.appendChild(periodEl);
  });

  pastPeriodContainer.appendChild(pastPeriodHeader);
  pastPeriodContainer.appendChild(pastPeriodList);
}

function formatDate(dateString) {
  // 日付文字列を Date オブジェクトに変換する
  const date = new Date(dateString);

  // 日付をロケール固有の文字列に書式化する。
  // 使い勝手を改善するため、ロケールにしてください。
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

renderPastPeriods();
