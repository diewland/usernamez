<?php
    /*
 
    PHP Proxy for cross-domain ajax
     * http://stackoverflow.com/questions/2558977/ajax-cross-domain-call
     * http://stackoverflow.com/a/697540/466693

    #### how to use ####
     
    function fetch(url){
        $.ajax({
            url: './proxy.php', // this file in same domain
            method: 'POST',
            data: { url: url },
            success: function(resp) {
                console.log(resp);
            }
        })
    }

    */
    $curl_handle=curl_init();
    curl_setopt($curl_handle, CURLOPT_URL, $_POST['url']);
    curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl_handle, CURLOPT_USERAGENT, 'proxyman');
    $query = curl_exec($curl_handle);
    curl_close($curl_handle);
    echo $query;
?>
