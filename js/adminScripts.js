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

var forms = [];

function Form(coords, name, mail, skype, cell_phone, contact_person, address, job_phone, filling_date) {
    this.coords = coords;
    this.name = name;
    this.mail = mail;
    this.skype = skype;
    this.cell_phone = cell_phone;
    this.contact_person = contact_person;
    this.address = address;
    this.job_phone = job_phone;
    this.filling_date = filling_date.replace(/-/gi, '/');
}

function receiptData() {
    $.ajax({
        url: '../php/getPartnersForms.php',
        type: 'POST',
        cache: false,
        success: function (msg) {
            var response = JSON.parse(msg);
            var dummy = $("#dummy");
            var filling_date;
            for (var i in response) {
                var row = response[i];
                forms[row[0]] = new Form(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]);
                filling_date = new Date(forms[row[0]].filling_date);
                dummy.clone().attr({"id": 'form-' + row[0]})
                    .appendTo("body").children("div.block_header").children("span").text(row[0]).parent().parent()
                    .children("table")
                    .children("caption").children("div.name").text(forms[row[0]].name).parent()
                    .children("div.fillingDate").text(filling_date.getDate() + " " + month_array[filling_date.getMonth()]).parent().parent()
                    .children("tbody").children("tr.coords").children("td.essence").text(forms[row[0]].coords).parent().parent()
                    .children("tr.mail").children("td.essence").text(forms[row[0]].mail).parent().parent()
                    .children("tr.job_phone").children("td.essence").text(forms[row[0]].job_phone).parent().parent()
                    .children("tr.cell_phone").children("td.essence").text(forms[row[0]].cell_phone).parent().parent()
                    .children("tr.skype").children("td.essence").text(forms[row[0]].skype).parent().parent()
                    .children("tr.address").children("td.essence").text(forms[row[0]].address).parent().parent()
                    .children("tr.contact_person").children("td.essence").text(forms[row[0]].contact_person);
            }
            dummy.remove();
        }
    })
}

$(document).ready(function () {
    receiptData();
});