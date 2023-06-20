const showHistory = () => {
  console.log(request.message);
  var websitesList = document.getElementById("websitesList");
  websitesList.innerHTML = "";
  // get websites from storage sync
  chrome.storage.sync.get(["websites"], function (data) {
    data.websites.forEach(function (website) {
      var li = document.createElement("li");
      var p = document.createElement("p");
      p.href = website.url;
      p.innerHTML = `<a href=${website.url} title=${website.url}>${new URL(
        website.url
      ).hostname.replace("www.", "")}</a> (Visits: ${website.visitCount})`;
      li.appendChild(p);

      websitesList.appendChild(li);
    });
  });
};

// trigger alarm
chrome.alarms.create("refresh", {
  periodInMinutes: 1,
});
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "refresh") {
    chrome.history.search({ text: "", maxResults: 10000 }, function (data) {
      console.log(data);
      var websites = data.map(function (item) {
        return { url: item.url, visitCount: item.visitCount };
      });
      websites.sort(function (a, b) {
        return b.visitCount - a.visitCount;
      });
      // chrome storage sync set
      chrome.storage.sync.set({ websites: websites.slice(0, 15) }, function () {
        console.log(websites.slice(0, 10));
        chrome.runtime.onMessage.addListener(function (
          request,
          sender,
          sendResponse
        ) {
          if (request.message == "popup_to_background") {
            console.log(request.message);
            var websitesList = document.getElementById("websitesList");
            websitesList.innerHTML = "";
            // get websites from storage sync
            chrome.storage.sync.get(["websites"], function (data) {
              data.websites.forEach(function (website) {
                var li = document.createElement("li");
                var p = document.createElement("p");
                p.href = website.url;
                p.innerHTML = `<a href=${website.url} title=${
                  website.url
                }>${new URL(website.url).hostname.replace(
                  "www.",
                  ""
                )}</a> (Visits: ${website.visitCount})`;
                li.appendChild(p);

                websitesList.appendChild(li);
              });
              sendResponse({ showHistory: showHistory() });
            });
            sendResponse({
              showHistory: (() => {
                console.log("recieved");
              })(),
            });
          }
        });
      });
    });
  }
});
