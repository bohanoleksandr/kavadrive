var visitTime = null;
var openingTime = null;
var closingTime = null;

var state = null;
    // Options, where date can't be decreased:
    //  1 - comparison with "now" only
    //  2 - comparison with "opening" and "closing" time
    //  3 - comparison with "now" and "closing" time
    // Options, where date can be decreased:
    //  4 - delay check only
    //  5 - comparison with "opening" and "closing" time + delay check

var month_array = {
    0: 'січня',
    1: 'лютого',
    2: 'березня',
    3: 'квітня',
    4: 'травня',
    5: 'червня',
    6: 'липня',
    7: 'серпня',
    8: 'вересня',
    9: 'жовтня',
    10: 'листопада',
    11: 'грудня'
};

var day_array = {
    0: 'НД',
    1: 'ПН',
    2: 'ВТ',
    3: 'СР',
    4: 'ЧТ',
    5: 'ПТ',
    6: 'СБ'
};

function addZero(n) {
    return n > 9 ? n : "0" + n;
}

function updateClock() {

    var now = new Date ();

    if (visitTime){
        if (order.pos) {
            if (shops[order.pos].round_the_clock){
                if (visitTime.getDate() == now.getDate()) {
                    state = 1;
                } else {
                    state = 4;
                }
            } else {
                var opening_hour = shops[order['pos']].opening_time.substr(0, 2);
                var opening_minute = shops[order['pos']].opening_time.substr(3, 2);

                var closing_hour = shops[order['pos']].closing_time.substr (0, 2);
                var closing_minute = shops[order['pos']].closing_time.substr(3, 2);

                openingTime = new Date ();
                openingTime.setDate (visitTime.getDate());
                openingTime.setMonth (visitTime.getMonth());
                openingTime.setHours (opening_hour, opening_minute, "00", "000");

                closingTime = new Date();
                closingTime.setDate (visitTime.getDate());
                closingTime.setMonth (visitTime.getMonth());
                closingTime.setHours (closing_hour, closing_minute, "00", "000");

                if (visitTime.getDate() == now.getDate()) {

                    if (now < openingTime) {
                        state = 2;
                    } else if (now < closingTime) {
                        state = 3;
                    } else {
                        visitTime.setTime(openingTime.getTime());
                        visitTime.setDate(openingTime.getDate() + 1);

                        updateClock();
                        return 0;
                    }

                } else {
                    state = 5;
                }
            }

        } else {
            if (visitTime.getDate() == now.getDate()) {
                state = 1;
            } else {
                state = 4;
            }
        }

    } else {
        visitTime = new Date();
        visitTime.setMinutes(visitTime.getMinutes() + 20);
        state = 1;
    }

    buttonActivator();

    $("#hours").html(addZero(visitTime.getHours()));
    $("#minutes").html(addZero(visitTime.getMinutes()));
    $("#order_date").html(visitTime.getDate());
    $("#order_month").html(month_array[visitTime.getMonth()]);
    $("#order_day").html(day_array[visitTime.getDay()]);
}

function buttonActivator () {

    switch (state) {
        case 1:
            $("#dayUp").css('visibility', 'visible');
            $("#dayDown").hide();

            $("#hoursUp").css('visibility', 'visible');
            $("#minutesUp").css('visibility', 'visible');

            nowCheck();

            break;

        case 2:
            $("#dayUp").css('visibility', 'visible');
            $("#dayDown").hide();

            openingClosingCheck();

            break;

        case 3:
            $("#dayUp").css('visibility', 'visible');
            $("#dayDown").hide();

            nowClosingCheck();

            break;

        case 4:
            $("#hoursDown").show();
            $("#minutesDown").show();
            $("#hoursUp").css('visibility', 'visible');
            $("#minutesUp").css('visibility', 'visible');

            delayCheck();

            break;

        case 5:
            delayCheck();
            openingClosingCheck();
            break;

        default:
            break;
    }
}

function nowCheck () {
    var now = new Date ();
    if (visitTime - now < (9 * 60 * 1000)) {
        visitTime.setTime(now.getTime());
        visitTime.setMinutes(visitTime.getMinutes() + 20);
        $("#hoursDown").hide();
        $("#minutesDown").show();
    } else if (visitTime - now < (14 * 60 * 1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").hide();
    } else if (visitTime - now < (70 * 60 * 1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").show();
    } else {
        $("#hoursDown").show();
        $("#minutesDown").show();
    }
}

function openingClosingCheck () {
    if (visitTime < openingTime) {
        visitTime = new Date(openingTime);
        $("#hoursDown").hide();
        $("#minutesDown").hide();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (visitTime - openingTime < (5*60*1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").hide();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (visitTime - openingTime < (60*60*1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (closingTime - visitTime < (5*60*1000)){
        visitTime.setMinutes(closingTime.getMinutes() - 5);
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'hidden');
    } else if (closingTime - visitTime < (10*60*1000)){
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'hidden');
    } else if (closingTime - visitTime < (65*60*1000)){
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'visible');
    } else {
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    }
}

function nowClosingCheck () {
    var now = new Date();
    if (visitTime - now < (10 * 60 * 1000)) {
        visitTime.setMinutes(now.getMinutes() + 10);
        $("#hoursDown").hide();
        $("#minutesDown").hide();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (visitTime - now < (14 * 60 * 1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").hide();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (visitTime - now < (70 * 60 * 1000)) {
        $("#hoursDown").hide();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    } else if (closingTime - visitTime < (5*60*1000)){
        visitTime.setMinutes(closingTime.getMinutes() - 5);
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'hidden');
    } else if (closingTime - visitTime < (10*60*1000)){
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'hidden');
    } else if (closingTime - visitTime < (65*60*1000)) {
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'hidden');
        $("#minutesUp").css('visibility', 'visible');
    } else {
        $("#hoursDown").show();
        $("#minutesDown").show();
        $("#hoursUp").css('visibility', 'visible');
        $("#minutesUp").css('visibility', 'visible');
    }
}

function delayCheck () {
    var now = new Date ();
    if (visitTime - now > (10 * 24 * 60 * 60 * 1000)){
        $("#dayUp").css('visibility', 'hidden');
        if (visitTime.getHours() == 23) {
            $("#hoursUp").css('visibility', 'hidden');
            if (visitTime.getMinutes() > 50) {
                $("#minutesUp").css('visibility', 'hidden');
            }
        }
    } else {
        $("#dayUp").css('visibility', 'visible');
    }

    if (visitTime - now < (24 * 60 * 60 * 1000)) {
        $("#dayDown").hide();
    } else {
        $("#dayDown").show();
    }
}

$(document).ready(function () {
    updateClock();

    $("#hoursUp").click(function () {
        visitTime.setHours(visitTime.getHours() + 1);
        updateClock();
    });

    $("#hoursDown").click(function () {
        visitTime.setHours(visitTime.getHours() - 1);
        updateClock();
    });

    $("#minutesUp").click(function () {
        visitTime.setMinutes(visitTime.getMinutes() + 5);
        updateClock();
    });

    $("#minutesDown").click(function () {
        visitTime.setMinutes(visitTime.getMinutes() - 5);
        updateClock();
    });

    $("#dayUp").click(function () {
        visitTime.setDate(visitTime.getDate() + 1);
        updateClock();
    });

    $("#dayDown").click(function () {
        visitTime.setDate(visitTime.getDate() - 1);
        updateClock();
    });
});

