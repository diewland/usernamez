// Copies a string to the clipboard. Must be called from within an
// event handler such as click. May return false if it failed, but
// this is not always possible. Browser support for Chrome 43+,
// Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
// Internet Explorer: The clipboard feature may be disabled by
// an administrator. By default a prompt is shown the first
// time the clipboard is used (per session).
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return prompt("Copy to clipboard: Ctrl+C, Enter", text);
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

// api
function proxy(url, callback){
    $.ajax({
        url: './proxy.php', // this file in same domain
        method: 'POST',
        data: { url: url },
        success: function(resp) {
          callback(resp);
        }
    })
}
function fetch_by_proxy(username, callback) {
  proxy('https://zonic.app/profile/' + username, resp => {
    let found = resp.match(/0x.{40}/);
    if (found === null)
      callback(null);
    else
      callback(found[0]);
  });
}
function fetch_by_api_v0(username, callback) {
  let api = 'https://api.zonic.app/v0/wallet/search?keyword=';
  proxy(api + username, out => {
    let resp = JSON.parse(out);
    if (resp.success) {
      let found = resp.search_results.find(r => r.username === username);
      if (found)
        callback(found.wallet_address);
      else
        callback(null);
    }
    else {
      callback(null);
    }
  });
}
//let resolve_wallet = fetch_by_proxy;
let resolve_wallet = fetch_by_api_v0;

// bind submit button
let processing = false;
$('#btn_submit').click(_ => {
  // process lock
  if (processing) return;
  processing = true;

  // get username
  let $btn = $(_.target);
  let username = $('#username').val().trim();
  if (!username) return;

  // loading
  $btn.removeClass('is-primary');
  $btn.addClass('is-disabled');
  $('#wallet').val('mapping...');

  // resolve wallet from username
  resolve_wallet(username, wallet => {
    // load done
    $btn.removeClass('is-disabled');
    $btn.addClass('is-primary');
    processing = false;
    // show wallet
    if (wallet)
      $('#wallet').val(wallet);
    else
      $('#wallet').val('username not found');
  });
});

// bind press enter on username
$('#username').on('keypress', e => {
  if (e.which != 13) return;
  $('#btn_submit').click();
});

// focus on username
$('#username').focus();

// bind copy button
$('#btn_copy').click(_ => {
  let addr = $('#wallet').val();
  copyToClipboard(addr);
  alert('Copied');
});
