
const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();


// 見出しの年月と曜日
const days = ['月', '火', '水', '木', '金', '土', '日'];
$("#month").html(year + '年' + (month + 1) + '月');
days.forEach(d => $("#dayLabel").append(`<th class="day_of_week">${d}</th>`));


// 当月のカレンダーに表示される前月の終わりの日々の配列を作る関数
function getPrevMonthdays(year, month) {
  const prevMonthDate = new Date(year, month, 0);
  const d = prevMonthDate.getDate();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevMonthYear = prevMonthDate.getFullYear();
  const startDay = new Date(year, month, 1).getDay();
  const dates = [];
  const numDays = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < numDays; i++) {
    dates.unshift({
      year: prevMonthYear,
      month: prevMonth,
      date: d - i,
      isToday: false,
      isDisabled: true,
      isHoliday: false,
    });
  }
  return dates;
}

getPrevMonthdays(year, month);

// 今月の日々の配列を作る関数
function getCurrentMonthDays(year, month) {
  const dates = [];
  const datesInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= datesInMonth; i++) {
    dates.push({
      year: year,
      month: month + 1,
      date: i,
      isToday: false,
      isDisabled: false,
      isHoliday: false,
    })
  }
  if (year === today.getFullYear() && month === today.getMonth()) {
    dates[today.getDate() - 1].isToday = true;
  }
  return dates;
}

getCurrentMonthDays(year, month);

// 当月のカレンダーに表示される翌月の日々の配列を作る関数
function getNextMonthdays(year, month) {
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextMonth = nextMonthDate.getMonth() + 1;
  const nextMonthYear = nextMonthDate.getFullYear();
  const dates = [];
  const lastDay = new Date(year, month + 1, 0).getDay();
  if (lastDay !== 0) {
    for (let i = 1; i <= 7 - lastDay; i++) {
      dates.push({
        year: nextMonthYear,
        month: nextMonth,
        date: i,
        isToday: false,
        isDisabled: true,
        isHoliday: false,
      })
    }
  }
  return dates;
}

getNextMonthdays(year, month);

// カレンダーを描画する関数
function makeCalendar(year, month) {

  $("#month").html(year + '年' + (month + 1) + '月');

  $("tbody").empty();
  const dates = [
    ...getPrevMonthdays(year, month),
    ...getCurrentMonthDays(year, month),
    ...getNextMonthdays(year, month),
  ];
  // console.log(dates);

  const weeks = [];
  const weeksCount = dates.length / 7;

  for (let i = 0; i < weeksCount; i++) {
    weeks.push(dates.splice(0, 7));
  }

  for (let i = 0; i < weeksCount; i++) {
    $("tbody").append(`<tr id="row${i}"></tr>`);
    weeks[i].forEach(date => {
      const monthStr = String(date.month).padStart(2, '0');
      const dayStr = String(date.date).padStart(2, '0');
      const dateId = `day${date.year}${monthStr}${dayStr}`;
      $(`#row${i}`).append(`<td><div id="${dateId}" class="date_box"><div class="day_box">${date.date}</div><div class=memo_box></div></div></td>`);
      if (date.isToday) {
        $(`#${dateId}>.day_box`).addClass('today');
      }
      if (date.isDisabled) {
        $(`#${dateId}`).addClass('isdisabled');
      }
      if (date.month === 4 && date.date === 11) {
        $(`#${dateId} .day_box`).addClass('moritaka_birthday');
      }
    });
  }
}

makeCalendar(year, month);

// APIを使って、今年と来年の祝日データを取得し、祝日表示する関数
function makeHolidays() {

  fetch('https://api.national-holidays.jp/recent')
    .then(response => response.json())
    .then(holidays => {
      // console.log('祝日', holidays);
      holidays.forEach(holiday => {
        const holidayName = holiday.name;
        const holidayId = `day${holiday.date.substr(0, 4)}${holiday.date.substr(5, 2)}${holiday.date.substr(8, 2)}`;
        // console.log(holidayName);
        // console.log(holidayId);
        $(`#${holidayId}>.day_box`).addClass('holiday').append(holidayName);
      })

    })
    .catch(error => {
      console.error('祝日データの取得に失敗しました：', error);
    });
}

makeHolidays();

// 「前月」クリックで前月のカレンダーを描画する関数
$("#prev").on("click", function () {
  month--;
  if (month < 0) {
    year--;
    month = 11;
  }
  makeCalendar(year, month);
  initScheduleData();
  makeHolidays();
});

// 「翌月」クリックで翌月のカレンダーを描画する関数
$("#next").on("click", function () {
  month++;
  if (month > 11) {
    year++;
    month = 0;
  }
  makeCalendar(year, month);
  initScheduleData();
  makeHolidays();
});

let allScheduleData = [];//予定データ全体

//関数定義：予定の復元
function initScheduleData() {
  const saved = localStorage.getItem('saveData');
  if (saved) {
    allScheduleData = JSON.parse(saved);
    allScheduleData.forEach(
      item => { $(`#${item.date} .memo_box`).append(`<div class="memo_box_item">${item.title}</div>`) })
  }
}

initScheduleData();//予定の復元

//関数定義：ローカルストレージに保存＆画面表示
function saveScheduleData() {
  const scheduleData = {
    date: $("#dateBoxId").text(),
    title: $("#title").val(),
    start: $("#startTime").val(),
    end: $("#endTime").val(),
    place: $("#place").val(),
    note: $("#note").val(),
  }
  allScheduleData.push(scheduleData);
  localStorage.setItem('saveData', JSON.stringify(allScheduleData));
  //↓画面に表示
  $(`#${scheduleData.date} > .memo_box`).append(`<div class="memo_box_item">${scheduleData.title}</div>`);
}

//保存ボタン処理
$("#save").on("click", function () {
  saveScheduleData();
  $(".overlay").css('display', 'none');
});

// 日をクリックして予定リスト画面を呼出
$("tbody").on("click", ".date_box", function () {
  // $(".event_overlay").css('display', 'block');
  $(".event_overlay").slideDown(300);

  const dateBoxId = $(this).attr('id');
  $("#eventDayId").html(dateBoxId);
  $("#dateBoxId").html(dateBoxId);
  const sheduleDate = `${dateBoxId.substr(3, 4)}年${dateBoxId.substr(7, 2)}月${dateBoxId.substr(9, 2)}日`;
  $("#eventDay").text(sheduleDate);

  $("#eventList").empty();//一度リストを初期化

  //予定がはいっていたら、その予定を表示
  const result = $(this).find('.memo_box_item');
  if (result.length) {
    const eventList = allScheduleData.filter(item => item.date === dateBoxId);
    eventList.forEach(item => {
      $("#eventList").append(`<li class="eventList_item">${item.start}：${item.title}</li>`);
    });
  }
});

//予定リスト画面のキャンセルボタン
// 予定リスト画面を閉じる
$("#eventCancel").on("click", function () {
  // $(".event_overlay").css('display', 'none');
  $(".event_overlay").slideUp(300);
});

let previousOverlay = null;
//現在の画面状態を記録する変数

//新規予定入力の表示、日付表示
$("#newEntry").on("click", function () {
  previousOverlay = 'eventList';

  $("#title").val("");
  $("#startTime").val("");
  $("#endTime").val("");
  $("#place").val("");
  $("#note").val("");
  const sheduleDate = $("#eventDay").text();
  $("#modalTitle").text(sheduleDate);
  $(".event_overlay").css('display', 'none');
  $(".overlay").css('display', 'block');

  $("#save").hide().show();//保存ボタン表示
  $("#upDate").hide();
  $("#delete").hide();
  //更新ボタン、削除ボタンは削除

});

//既存予定をクリック→予定編集画面に遷移
$("#eventList").on("click", ".eventList_item", function () {

  previousOverlay = 'eventList';

  const text = $(this).text();
  const start = text.substr(0, 5);
  const title = text.substr(6);
  const targetDate = $("#eventDayId").text();

  const index = allScheduleData.findIndex(item => item.date === targetDate && item.title === title && item.start === start);

  if (index !== -1) {
    const item = allScheduleData[index];

    $("#title").val(item.title);
    $("#startTime").val(item.start);
    $("#endTime").val(item.end);
    $("#place").val(item.place);
    $("#note").val(item.note);
    $("#modalTitle").text(`${item.date.substr(3, 4)}年${item.date.substr(7, 2)}月${item.date.substr(9, 2)}日`);
    $("#dateBoxId").text(item.date);
    $("#editingIndex").val(index);

    $(".event_overlay").css('display', 'none');
    $(".overlay").css('display', 'block');

    $("#save").hide();//保存ボタン削除
    $("#upDate").hide().show();
    $("#delete").hide().show();
    //更新ボタン、削除ボタンは表示

  } else {
    alert('該当データがありません')
  }

});

// イベント編集後の更新
$("#upDate").on("click", function () {
  const index = $("#editingIndex").val();

  if (index !== "") {
    const upDateItem = {
      date: $("#dateBoxId").text(),
      title: $("#title").val(),
      start: $("#startTime").val(),
      end: $("#endTime").val(),
      place: $("#place").val(),
      note: $("#note").val(),
    };

    allScheduleData[index] = upDateItem;
    localStorage.setItem('saveData', JSON.stringify(allScheduleData));

    $(".memo_box").empty();
    initScheduleData();

    $(".overlay").css('display', 'none');
  }
});

// イベントの削除

$("#delete").on("click", function () {
  console.log('ok');
  const index = $("#editingIndex").val();
  console.log(index);
  if (index !== "") {
    allScheduleData.splice(index, 1);

    localStorage.setItem('saveData', JSON.stringify(allScheduleData));
    $(".memo_box").empty();
    initScheduleData();

    $(".overlay").css('display', 'none');
  }
});


//関数の定義：ローカルストレージデータ削除
function clearScheduleData() {
  const result = confirm('保存データを削除しますか？');
  if (!result)
    return;
  $(".memo_box").empty();
  localStorage.removeItem('saveData');
  allScheduleData = [];
  alert('保存データを削除しました');
}

//全予定データ削除処理
$("#dataClear").on("click", function () {
  clearScheduleData();
});

//予定入力画面のキャンセルボタン
$("#modalCancel").on("click", function () {
  $(".overlay").css('display', 'none');

  if (previousOverlay === 'eventList') {
    $(".event_overlay").css('display', 'block');
  }
  previousOverlay === null;
});

// 壁紙選択関係アクション
$("#selectWallPaper").on("click", function () {
  $(".wallPaper_overlay").css('display', 'block');
});


// 画像選択アクション
let selectedWallPaper = null;//画像パス

$(".wallPaper").on("click", function () {
  $(".wallPaper").removeClass('selected');//初期化、選択状態リセット
  $(this).addClass('selected');
  //クリック画像を選択状態に

  selectedWallPaper = $(this).find("img").attr("src");//選択画像のパスを取得
});

//選択した壁紙へ壁紙の変更、ストレージにパスを保存
$("#wallPaperChange").on("click", function () {
  if (selectedWallPaper) {
    $(".cal_wrapper").css('background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%), url(${selectedWallPaper})`);//背景変更

    localStorage.setItem('wallPaper', selectedWallPaper);//ストレージに保存

    $(".wallPaper_overlay").css('display', 'none');

  } else {
    alert('壁紙を選択してください');
  }
});

// ストレージに保存した壁紙の読み込み
$(function () {
  const savedWallPaper = localStorage.getItem('wallPaper');
  if (savedWallPaper) {
    $(".cal_wrapper").css('background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%), url(${savedWallPaper})`);
  }
});

// 壁紙選択画面のキャンセル
$("#wallPaperCancelBtn").on("click", function () {
  $(".wallPaper_overlay").css('display', 'none');
});




