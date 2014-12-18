<?php
include_once('connectdb.php');

$customer = array(
    'id' => null,
    'phoneNumber' => null,
    'firstName' => $_POST ['first_name'],
    'lastName' => $_POST ['last_name'],
);

$identity = $_POST ['identity'];
$network = $_POST ['network'];

$searchingQuery = "SELECT `id`, `phoneNumber` FROM `customers` cus WHERE cus.identitySoc = '".$identity."'";
$result = mysql_query ($searchingQuery) or die (mysql_error());
if (mysql_num_rows($result)==1){
    $row = mysql_fetch_array($result) or die(mysql_error());
    $customer['id'] = $row['id'];
    $customer['phoneNumber'] = $row['phoneNumber'];
}else{
    $recordingUserQuery = "INSERT INTO `customers` (`identitySoc`, `network`, `firstName`, `lastName`) VALUES ('"
        .$identity."', '".$network."', '".$customer['firstName']."', '".$customer['lastName']."')";
    mysql_query ($recordingUserQuery);
    $customer['id'] = mysql_insert_id();
}

echo json_encode($customer);

?>