<?php
include_once('connectdb.php');

$customer = array(
    'id' => null,
    'mail' => $_POST['mail'],
    'firstName' => $_POST['name'],
    'lastName' => $_POST['surname'],
);

$customerNewness = true;

$action = $_POST['action'];

$searchingQuery = "SELECT `id`, `firstName`, `lastName` FROM `customers` cus WHERE cus.mail = '".$customer['mail']."'";
$result = mysql_query ($searchingQuery) or die (mysql_error());
if (mysql_num_rows($result)==1) $customerNewness = false;

if ($action == "check" && !$customerNewness){
    $row = mysql_fetch_array($result) or die (mysql_error());
    $customer['firstName'] = $row['firstName'];
    $customer['lastName'] = $row['lastName'];
} else if ($action == "enter") {
    if ($customerNewness) {
        $recordingUserQuery = "INSERT INTO `customers` (`mail`, `firstName`, `lastName`)
                VALUES ('".$customer['mail']."', '".$customer['firstName']."', '".$customer['lastName']."')";
        mysql_query ($recordingUserQuery);
        $customer['id'] = mysql_insert_id();
    } else {
        $row = mysql_fetch_array($result) or die (mysql_error());
        $customer['id'] = (int)$row['id'];
        if ($customer['firstName']){
            $editUserQuery = "UPDATE `customers` SET `firstName` = '".$customer['firstName']."', `lastName` = '".$customer['lastName']."' WHERE `id` = '".$customer['id']."';";
            mysql_query($editUserQuery);
        }
    }
}

echo json_encode($customer);
?>