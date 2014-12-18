<?php
include_once('connectdb.php');

//if (get_magic_quotes_gpc()) {
//    $process = array(&$_GET, &$_POST, &$_COOKIE, &$_REQUEST);
//    while (list($key, $val) = each($process)) {
//        foreach ($val as $k => $v) {
//            unset($process[$key][$k]);
//            if (is_array($v)) {
//                $process[$key][stripslashes($k)] = $v;
//                $process[] = &$process[$key][stripslashes($k)];
//            } else {
//                $process[$key][stripslashes($k)] = stripslashes($v);
//            }
//        }
//    }
//    unset($process);
//}

$order = json_decode($_POST['order']);
$customerId = $_POST['customerId'];

$pos = $order->pos;
$content = $order->content;
$visit_time = $order->visitTime;
$sum = 0;

$query_result = mysql_query ("SELECT id, price FROM products");

while($row = mysql_fetch_assoc($query_result)){
    $prices[$row['id']] = $row['price'];
}

foreach ($content as $product=>$quantity) {
    $sum += $prices[$product]*$quantity;
}

$recordingOrder = "INSERT INTO `orders` (`customer`, `pos`, `sum`, `order_status`, `visit_time`) VALUES ('"
    .$customerId."', '".$pos."', '".$sum."', '1', '".$visit_time."');";
$result = mysql_query($recordingOrder);
$recordId = mysql_insert_id();
$result = mysql_query("INSERT INTO `order_history` (`order_id`, `action`) VALUES ('".$recordId."', '1');");

foreach ($content as $product=>$quantity) {
    $recordingContent = "INSERT INTO `order_content` (`order_id`, `product_id`, `quantity`) VALUES ('".$recordId."', '".$product."', '".$quantity."')";
    $result = mysql_query($recordingContent);
}
if ($result == true) echo $recordId;
?>