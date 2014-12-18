var shops = [];
var rows = [];

function Shop (name, street, house_number, phone) {
    this.name = name;
    this.street = street;
    this.house_number = house_number;
    this.phone = phone;
}

$(document).ready (getContacts());

function getContacts () {
    $.ajax({
        url: 'php/getShops.php',
        type: 'POST',
        cache: false,
        success: function (msg) {
            var response = JSON.parse(msg);

            for (var r in response) {
                var row = response[r];
                shops[row[0]] = new Shop(row[1], row[4], row[5], row[8]);
            }

            for (var i = 1; i < shops.length; ++i) {
                if (shops [i]) {
                    var shopNameTd = '<td>' + shops[i].name + '</td>';
                    var shopAddressTd = '<td>' + shops[i].street + ', ' + shops[i].house_number;
                    var phoneTd = '<td>' + shops[i].phone + '</td>';
                    rows [i] = '<tr>' + shopNameTd + shopAddressTd + phoneTd + '</tr>';

                    $(rows [i]).appendTo ($('tbody'));
                }
            }
        }
    });
}
