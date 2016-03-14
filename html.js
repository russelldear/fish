
module.exports = {
    
    start: function () {
        return "<html><body>";
    },
    
    row: function () {
        return "<div><b>%1$s</b> - Date: %2$s - <a href=\'https://www.flowdock.com/app/xero/%1$s/threads/%3$s\'>%4$s</a></div>";
    },
    
    end: function () {
        return "</body></html>";
    }
};