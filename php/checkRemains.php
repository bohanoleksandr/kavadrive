<?php
include_once('connectdb.php');

$shopNumber = $_POST['shopNumber'];

$result = mysql_query ("SELECT
								`actual_remains`.`quantity`,
								`ingredients`.`name`,
								`ingredients`.`unit`,
								`ingredients`.`id`
							FROM
								`actual_remains`
									LEFT JOIN
								`ingredients` ON `ingredients`.`id` = `actual_remains`.`ingredient`
							WHERE
								`actual_remains`.`shop` = ".$shopNumber.";");
$balanceOfGoods = array();
while($myrow = mysql_fetch_assoc($result)){
    $balanceOfGoods[] = array("quantity"=>$myrow['quantity'],"name"=>$myrow['name'],"unit"=>$myrow['unit'],"id"=>$myrow['id']);
}
echo json_encode($balanceOfGoods);