<?php
include_once('connectdb.php');

$result = mysql_query ("SELECT `id`, `name`, `eng_name`, `opening_time`, `closing_time`, `street`, `house_number`, `latitude`,
  `longitude`, `phone`, `town` FROM `stores` WHERE `visibility` = 1;");
$shops = array();
while($row = mysql_fetch_assoc($result)){
    $shops[] = array(
        $row['id'],
        $row['name'],
        $row['eng_name'],
        $row['opening_time'],
        $row['closing_time'],
        $row['street'],
        $row['house_number'],
        $row['latitude'],
        $row['longitude'],
        $row['phone'],
        $row['town']
    );
}

echo json_encode($shops);
?>