<?php
include_once('connectdb.php');

$partnersForms = array();

$result = mysql_query("SELECT * FROM partners");

while ($form = mysql_fetch_assoc($result)){
    $partnersForms[] = array($form['id'], $form['coords'], $form['name'], $form['mail'], $form['skype'],
        $form['cell_phone'], $form['contact_person'], $form['address'], $form['job_phone']);
}

echo json_encode($partnersForms);