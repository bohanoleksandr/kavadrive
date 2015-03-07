<?php
include_once('connectdb.php');

$customer = array(
    'id' => null,
    'mail' => $_POST['mail'],
    'firstName' => $_POST['name'],
    'lastName' => $_POST['surname'],
);

$searchingQuery = "SELECT `id`, `firstName`, `lastName` FROM `customers` cus WHERE cus.mail = '".$customer['mail']."'";
$result = mysql_query ($searchingQuery) or die (mysql_error());
if (mysql_num_rows($result)==1){
    $row = mysql_fetch_array($result) or die (mysql_error());
    $customer['id'] = $row['id'];
    $customer['firstName'] = $row['firstName'];
    $customer['lastName'] = $row['lastName'];
}else{
    $recordingUserQuery = "INSERT INTO `customers` (`mail`, `firstName`, `lastName`)
        VALUES ('".$customer['mail']."', '".$customer['firstName']."', '".$customer['lastName']."')";
    mysql_query ($recordingUserQuery);
    $customer['id'] = mysql_insert_id();
}

echo json_encode($customer);
?>