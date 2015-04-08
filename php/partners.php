<?php
include_once('connectdb.php');

$name = $_POST['name'];
$coords = $_POST['coords'];
$mail = $_POST['mail_p'];
$job_phone = $_POST['job_phone'];
$cell_phone = $_POST['cell_phone'];
$skype = $_POST['skype'];
$address = $_POST['address'];
$contact_person = $_POST['contact_person'];

$recordingOrder = "INSERT INTO `partners` (`name`, `coords`, `mail`, `job_phone`, `cell_phone`, `skype`, `address`,
 `contact_person`) VALUES ('".$name."', '".$coords."', '".$mail."', '".$job_phone."', '".$cell_phone."', '".$skype."',
  '".$address."', '".$contact_person."');";
$result = mysql_query($recordingOrder);

echo $result;