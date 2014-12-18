<?php
include_once('connectdb.php');

$customer = array(
    'id' => null,
    'phoneNumber' => $_POST['phoneNum'],
    'firstName' => null,
    'lastName' => null,
);

$searchingQuery = "SELECT `id`, `firstName`, `lastName` FROM `customers` cus WHERE cus.phoneNumber = '".$customer['phoneNumber']."'";
$result = mysql_query ($searchingQuery) or die (mysql_error());
if (mysql_num_rows($result)==1){
    $row = mysql_fetch_array($result) or die (mysql_error());
    $customer['id'] = $row['id'];
    $customer['firstName'] = $row['firstName'];
    $customer['lastName'] = $row['lastName'];
}else{
    $recordingUserQuery = "INSERT INTO `customers` (`phoneNumber`) VALUES ('".$customer['phoneNumber']."')";
    mysql_query ($recordingUserQuery);
    $customer['id'] = mysql_insert_id();
}

echo json_encode($customer);
?>