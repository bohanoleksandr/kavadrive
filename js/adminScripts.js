var forms = [];

function Form (coords, name, mail, skype, cell_phone, contact_person, address, job_phone) {
    this.coords = coords;
    this.name = name;
    this.mail = mail;
    this.skype = skype;
    this.cell_phone = cell_phone;
    this.contact_person = contact_person;
    this.address = address;
    this.job_phone = job_phone;
}

function receiptData(){
    $.ajax ({
        url: '../php/getPartnersForms.php',
        type: 'POST',
        cache: false,
        success: function(msg){
            var response=JSON.parse(msg);
            var dummy = $("#dummy");
            for (var i in response) {
                var row = response[i];
                forms[row[0]] = new Form (row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]);
                dummy.clone().attr({"id": 'form-' + row[0]})
                    .appendTo("body")
                    .children("caption").text(forms[row[0]].name).parent()
                    .children("tbody").children("tr.coords").children("td").text(forms[row[0]].coords).parent().parent()
                    .children("tr.mail").children("td").text(forms[row[0]].mail).parent().parent()
                    .children("tr.job_phone").children("td").text(forms[row[0]].job_phone).parent().parent()
                    .children("tr.cell_phone").children("td").text(forms[row[0]].cell_phone).parent().parent()
                    .children("tr.skype").children("td").text(forms[row[0]].skype).parent().parent()
                    .children("tr.address").children("td").text(forms[row[0]].address).parent().parent()
                    .children("tr.contact_person").children("td").text(forms[row[0]].contact_person);
            }
            dummy.remove();
        }
    })
}

$(document).ready (function() {
    receiptData();
});