<?php
include_once('connectdb.php');

$result = mysql_query ("SELECT `id`, `name`, `name_eng`, `name_rus`, `opening_time`, `closing_time`, `street`,
  `street_eng`, `street_rus`, `house_number`, `latitude`,
  `longitude`, `phone`, `town` FROM `stores` WHERE `visibility` = 1;");
$shops = array();
while($row = mysql_fetch_assoc($result)){
    $shops[] = array(
        $row['id'],
        $row['name'],
        $row['name_eng'],
        $row['name_rus'],
        $row['opening_time'],
        $row['closing_time'],
        $row['street'],
        $row['street_eng'],
        $row['street_rus'],
        $row['house_number'],
        $row['latitude'],
        $row['longitude'],
        $row['phone'],
        $row['town']
    );
}

echo json_encode($shops);
?>