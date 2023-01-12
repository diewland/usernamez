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

// proxy guy
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
  proxy('https://zonic.app/profile/' + username, resp => {
    // load done
    $btn.removeClass('is-disabled');
    $btn.addClass('is-primary');
    processing = false;
    // find wallet from response
    let found = resp.match(/0x.{40}/);
    if (found === null) {
      $('#wallet').val('username not found');
    }
    else {
      let wallet = found[0];
      $('#wallet').val(wallet);
    }
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
