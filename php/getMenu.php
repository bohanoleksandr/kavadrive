<?php
include_once('connectdb.php');

$result = mysql_query ("SELECT id, name, amount, price FROM products WHERE visibility = true");
$menu = array();
while($myrow = mysql_fetch_assoc($result)){
    $menu[] = array($myrow['id'], $myrow['name'], $myrow['amount'], $myrow['price']);
}
echo json_encode($menu);
?>