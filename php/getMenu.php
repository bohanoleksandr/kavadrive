<?php
include_once('connectdb.php');

$result = mysql_query ("SELECT id, name, amount, price, sequence_number, eng_name, rus_name FROM products WHERE sequence_number IS NOT NULL
  ORDER BY sequence_number");
$menu = array();
while($myrow = mysql_fetch_assoc($result)){
    $menu[] = array($myrow['id'], $myrow['name'], $myrow['eng_name'], $myrow['rus_name'], $myrow['amount'], $myrow['price']);
}
echo json_encode($menu);
?>