
const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
// const date = today.getDate();
// const day = today.getDay();
// const firstDay = new Date(year, month, 1);
// const lastDay = new Date(year, month + 1, 0);
// const startDay = firstDay.getDay();
// const datesInMonth = lastDay.getDate();
console.log(year);
console.log(month);
// console.log(date);
// console.log(day);
// console.log(firstDay.toLocaleString());
// console.log(lastDay.toLocaleString());
// console.log(startDay);
// console.log(datesInMonth);


const days = ['月', '火', '水', '木', '金', '土', '日'];

$("#month").html(year + '年' + (month + 1) + '月');

days.forEach(d => $("#dayLabel").append(`<th class="day_of_week">${d}</th>`));



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
  // console.log(dates);
  return dates;
}

getPrevMonthdays(year, month);


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
  // console.log(dates);
  return dates;
}

getCurrentMonthDays(year, month);

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
  // console.log(dates);
  return dates;
}

getNextMonthdays(year, month);

function makeCalendar(year, month) {

  $("#month").html(year + '年' + (month + 1) + '月');

  $("tbody").empty();
  const dates = [
    ...getPrevMonthdays(year, month),
    ...getCurrentMonthDays(year, month),
    ...getNextMonthdays(year, month),
  ];
  console.log(dates);

  const weeks = [];
  const weeksCount = dates.length / 7;

  for (let i = 0; i < weeksCount; i++) {
    weeks.push(dates.splice(0, 7));
  }
  console.log(weeks);

  // weeks.forEach(week => {
  //   $("tbody").append(`<tr id="row"></tr>`);
  //   week.forEach(date => {
  //     $("#row").append(`<td>${date.date}</td>`);
  //   });
  // });

  for (let i = 0; i < weeksCount; i++) {
    $("tbody").append(`<tr id="row${i}"></tr>`);
    weeks[i].forEach(date => {
      const monthStr = String(date.month).padStart(2, '0');
      const dayStr = String(date.date).padStart(2, '0');
      const dateId = `day${date.year}${monthStr}${dayStr}`;
      $(`#row${i}`).append(`<td><div id="${dateId}" class="date_box"><div class="day_box">${date.date}</div><div class=memo_box></div></div></td>`);
      if (date.isToday) {
        $(`#${dateId}`).addClass('today');
      }
      if (date.isDisabled) {
        $(`#${dateId}`).addClass('isdisabled');
      }
    });
  }
}

makeCalendar(year, month);

$("#prev").on("click", function () {
  month--;
  if (month < 0) {
    year--;
    month = 11;
  }
  makeCalendar(year, month);
  initScheduleData();
});

$("#next").on("click", function () {
  month++;
  if (month > 11) {
    year++;
    month = 0;
  }
  makeCalendar(year, month);
  initScheduleData();
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

//保存処理
$("#save").on("click", function () {
  saveScheduleData();
  $(".overlay").css('display', 'none');
});

//予定入力画面の表示、日付表示
$("tbody").on("click", ".date_box", function () {
  $("#title").val("");
  $("#startTime").val("");
  $("#endTime").val("");
  $("#place").val("");
  $("#note").val("");
  const dateBoxId = $(this).attr('id');
  console.log(dateBoxId);
  $("#dateBoxId").html(dateBoxId);
  const sheduleDate = `${dateBoxId.substr(3, 4)}年${dateBoxId.substr(7, 2)}月${dateBoxId.substr(9, 11)}日`;
  console.log(sheduleDate);
  $("#modalTitle").text(sheduleDate);
  $(".overlay").css('display', 'block');
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

//データ削除処理
$("#dataClear").on("click", function () {
  clearScheduleData();

});

//キャンセルボタン作る。
