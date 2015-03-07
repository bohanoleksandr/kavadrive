<?php
include_once('connectdb.php');

$customer = array(
    'id' => $_COOKIE['userId'],
    'phoneNumber' => null,
    'mail' => null,
    'firstName' => null,
    'lastName' => null,
);

if ($customer['id']) {
    $searchingQuery = "SELECT `phoneNumber`, `mail`, `firstName`, `lastName` FROM `customers` u WHERE u.id = '".$customer['id']."'";
    $result = mysql_query ($searchingQuery) or die (mysql_error());
    $row = mysql_fetch_array($result) or die (mysql_error());
    $customer['phoneNumber'] = $row['phoneNumber'];
    $customer['mail'] = $row['mail'];
    $customer['firstName'] = $row['firstName'];
    $customer['lastName'] = $row['lastName'];
}

echo json_encode($customer);