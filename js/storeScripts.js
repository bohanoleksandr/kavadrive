var orders = [];
var ordersLength = null;
var selected_order = null;
var statuses_to_show = [];
for (var i = 1; i <= 5; i++) statuses_to_show [i] = true;

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

var statuses_array = {
    1: 'відкрито',
    2: 'підготовлено',
    3: 'не з’явився',
    4: 'cкасовано',
    5: 'продано'
};

var status_class_array = {
    1: 'info',
    2: 'warning',
    3: 'error',
    4: 'cancelled',
    5: 'success'
};

receiptData ();
setInterval ('receiptData()', 10000);

function receiptData () {
    $.post(
        "../php/getOrders.php",
        function (result) {
            var receivedData = JSON.parse(result);
            orders = receivedData['orders'];
            for (var i = 0; i < orders.length; i++) {
                orders[i]['visitTime'] = orders[i]['visitTime'].replace(/-/gi, '/');
                orders[i]['orderTime'] = orders[i]['orderTime'].replace(/-/gi, '/');
            }
            $('#seller').text(' ' + receivedData['worker']);
            $('#shop').text(' ' + shops[currentShop]);
            //$('#modalWindow').modal('hide');
            if (ordersLength && orders.length > ordersLength) sound(1);
            ordersLength = orders.length;
            fillTable();
            alarm();
        }
    );
}

function fillTable () {
    $('.tableRow').remove();
    for (var i = 0; i < orders.length; i++) {
        if (statuses_to_show [orders[i]['status']]) buildRow(orders[i]);
    }
}

function buildRow (order) {
    var tagWithNameSurname = "-";

    if (order['identitySoc']) {
        tagWithNameSurname = '<a href="' + order['identitySoc'] + '" target="blank">' + order['firstName'] + ' '
        + order['lastName'] + '</a>';
    } else if (order['firstName']) {
        tagWithNameSurname = order['firstName'] + ' ' + order['lastName'];
    }

    var phoneNumberOrMail = "-";
    if (order['phoneNumber']) {
        phoneNumberOrMail = order['phoneNumber'];
    } else if (order['mail']){
        phoneNumberOrMail = order['mail'];
    }

    var mail = "-";
    if (order['mail']) {
        mail = order['mail'];
    }

    var visitTime = new Date(order['visitTime']);
    var difference = visitTime.getTimezoneOffset()/60;
    visitTime.setHours(visitTime.getHours() - difference);

    var visitTimeHour = visitTime.getHours();
    if (visitTimeHour < 10) {
        visitTimeHour = '0' + visitTimeHour;
    }

    var visitTimeMinutes = visitTime.getMinutes();
    if (visitTimeMinutes < 10) {
        visitTimeMinutes = '0' + visitTimeMinutes;
    }

    var visitTimeDate = visitTime.getDate();
    var visitTimeMonth = month_array [visitTime.getMonth()];

    var orderTime = new Date(order['orderTime']);
    orderTime.setHours(orderTime.getHours() + 1);

    var orderTimeHour = orderTime.getHours();
    if (orderTimeHour < 10) {
        orderTimeHour = '0' + orderTimeHour;
    }

    var orderTimeMinutes = orderTime.getMinutes();
    if (orderTimeMinutes < 10) {
        orderTimeMinutes = '0' + orderTimeMinutes;
    }

    var orderTimeDate = orderTime.getDate();
    var orderTimeMonth = month_array [orderTime.getMonth()];

    var sum = Number (order['sum']);

    var changeMaker = order['changeMaker'];
    if (!changeMaker) changeMaker = "дані відсутні";
    if (order['status'] == 1) changeMaker = '';

    var now = new Date();
    var additionNewClass = '';
    var tagWithOrderId = order['id'];

    if (now - orderTime < 5 * 60 * 1000 && order.status == 1) {
        additionNewClass = 'new';
        tagWithOrderId += ' (нове)';
    }

    var htmlForTableRow =
        '<tr class="tableRow ' + status_class_array[order.status] + ' ' + additionNewClass + '">'
        + '<td class="td_id">' + tagWithOrderId + '</td>'
        + '<td class="td_content"><img title="Переглянути зміст замовлення № ' + order['id'] + '" ' +
            'id="content' + order['id'] + '" src="../images/paper.jpg"></td>'
        + '<td class="td_customer">' + tagWithNameSurname + '</td>'
        + '<td class="td_phone">' + phoneNumberOrMail + '</td>'
        + '<td class="td_time">' + visitTimeHour + ':' + visitTimeMinutes + ' - ' + visitTimeDate + ' ' + visitTimeMonth + '</td>'
        + '<td class="td_date">' + orderTimeHour + ':' + orderTimeMinutes + ' - ' + orderTimeDate + ' ' + orderTimeMonth + '</td>'
        + '<td class="td_sum">' + sum.toFixed(2) + '</td>'
        + '<td class="td_status">' + statuses_array [order['status']] + '</td>'
        + '<td class="td_worker">' + changeMaker + '</td>'
        + '</tr>';
    $('table#ordersList tbody').append(htmlForTableRow);
}

function changeStatus(new_status) {
    $.post(
        "../php/changeStatus.php",
        {
            order_id: selected_order,
            new_status: new_status
        },
        function (result) {
            if (new_status == 5) {
                $('.changeStatus').addClass ('disabled');
                $('#printDoc').removeClass('disabled');
            }
            for (var i = 0; i < orders.length; i++) {
                if (orders[i].id == selected_order)
                    orders[i].status = new_status;
            }
            $('#current_status').children('span').text(statuses_array[new_status]);
            $('#alarm')[0].pause();
            fillTable();
        }
    );
}

function sound (track){
    switch (track) {
        case 1:
            $('#notifyAudio')[0].play();
            break;
        case 2:
            $('#alarm')[0].play();
            break;
        default:
            break;
    }
}

function alarm () {
    var now = new Date ();
    var visitTime = null;
    for (var i = 0; i < orders.length; i++) {
        visitTime = new Date (orders[i].visitTime);
        var difference = visitTime.getTimezoneOffset()/60;
        visitTime.setHours(visitTime.getHours() - difference);
        if (visitTime - now < (10*60*1000)+10000 && visitTime - now > 10*60*1000 && orders[i].status == 1) {
            $('#content' + orders[i].id).trigger ('click');
            sound(2);
        }
    }
}

$('.search').change(function () {
    var success_search = false;
    var sub_string = $(this).val();
    var this_id = this.id;
    var rows = $('.' + this_id);
    for (var i = 0; i < rows.length; i++) {
        var string = rows[i].innerHTML;
        if (string.indexOf(sub_string) < 0) {
            $(rows[i]).parent().hide();
        } else {
            $(rows[i]).parent().show();
        }
        if ($(rows[i]).parent().css('display') != 'none') success_search = true;
    }
    if (!success_search) {
        $('#unsuccessful_search').css('display', 'block');
    } else {
        $('#unsuccessful_search').css('display', 'none');
    }
});

$(document).on('click', 'img', function () {
    var tableBody = $('table#orderContent tbody');
    tableBody.empty();
    selected_order = parseInt(this.id.substr(7));
    for (var j = 0; j < orders.length; j++) {
        if (orders[j].id == selected_order)
            var orderObject = orders[j];
    }
    $("#orderId").text(selected_order);
    $('#current_status').children('span').text(statuses_array[orderObject.status]);

    for (var i = 0; i < orderObject.content.length; i++) {
        tableBody.append('<tr><td>' + orderObject.content[i]['itemName'] + '</td><td>'
        + orderObject.content[i]['amount'] + '</td><td>'
        + orderObject.content[i]['quantity'] + '</td><td>'
        + orderObject.content[i]['price'] + '</td></tr>');
    }
    tableBody.append('<tr><td colspan ="3">Всього</td><td>' + orderObject.sum + '</td></tr>');

    if (orderObject.status == 5) {
        $('#printDoc').removeClass('disabled');
        $('.changeStatus').addClass('disabled');
    } else {
        $('#printDoc').addClass('disabled');
        $('.changeStatus').removeClass('disabled');
    }

    $('#modalWindow').modal();
});

$(document).on ('click', 'span#help', function(){
    $("#instruction").modal();
});

$('.changeStatus').click (function() {
    changeStatus(this.id.substr(12));
});

$('.print').click(function () {
    if ($(this).hasClass("disabled")) {
        return;
    }
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == selected_order)
            var orderObj = orders[i];
    }
    var date = new Date();
    var formatDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    var list = '';
    for (var j = 0; j < orderObj.content.length; j++){
        list += '<tr><td>' + orderObj.content[j]['itemName'] + '</td><td>'
            + orderObj.content[j]['amount'] + '</td><td>'
            + orderObj.content[j]['quantity'] + '</td><td>'
            + orderObj.content[j]['price'] + '</td></tr>'
    }
    var seller = $("#seller").text();
    var win = window.open('', '', 'left=50,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');
    win.document.open();
    win.document.writeln(
        '<html><head><title>Друк накладної</title>' +
        '<link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css"/>' +
        '<link href="../css/store_styles.css" rel="stylesheet" type="text/css"/>' +
        '</head><body>' +
        '<div class="btn-group buttons"> <div class="btn btn-primary" onclick="window.print();">Друк</div>' +
        '<div class="btn" onclick="window.close();">Закрити</div></div><hr>' +
        '<h4>Кавово-чайна компанія Anzavi</h4>' +
        '<h3>Накладна № ' + selected_order + '</h3>' +
        '<h5 class="date">Від ' + formatDate + '</h5>' +
        '<table class="table table-bordered table-condensed">' +
        '<thead>' +
        '<tr>' +
        '<th>Назва</th>' +
        '<th>Об’єм</th>' +
        '<th>К-сть</th>' +
        '<th>Ціна</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody class="listInvoice"> ' + list +
        '<tr><td colspan ="3">Всього</td><td>' + orderObj.sum + '</td></tr>' +
        '</tbody>' +
        '</table>' +
        '<h5>Продавець ' + seller + '</h5>' +
        '</div></body></html>'
    );
});

$('.closeWindow').click(function () {
    $('#alarm')[0].pause();
    $('#modalWindow').modal('hide');
});

$('.exit').click(function () {
    $.cookie('worker', null, {'expires': -1, 'path': "/"});
    $('input[name="login"]').val(null);
    window.location.reload();
});

$('input.sorting_checkbox').change(function() {
    var statusId = $(this).parent()[0].id.substr(7);
    statuses_to_show [statusId] = !statuses_to_show [statusId];
    fillTable();
});

$('#modalWindow').on('hidden.bs.modal', function () {
    $('#alarm')[0].pause();
});