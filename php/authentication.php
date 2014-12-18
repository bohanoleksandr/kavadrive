<?php
include_once('connectdb.php');

$customer = array(
    'id' => $_COOKIE['userId'],
    'phoneNumber' => null,
    'firstName' => null,
    'lastName' => null,
);

if ($customer['id']) {
    $searchingQuery = "SELECT `phoneNumber`, `firstName`, `lastName` FROM `customers` u WHERE u.id = '".$customer['id']."'";
    $result = mysql_query ($searchingQuery) or die (mysql_error());
    $row = mysql_fetch_array($result) or die (mysql_error());
    $customer['phoneNumber'] = $row['phoneNumber'];
    $customer['firstName'] = $row['firstName'];
    $customer['lastName'] = $row['lastName'];
}

echo json_encode($customer);