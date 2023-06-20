const showHistory = () => {
  var websitesList = document.getElementById("websitesList");
  websitesList.innerHTML = "";
  // get websites from storage local
  let w = [];
  chrome.storage.local.get(["state"], function (data) {
    if (data.state === "SITE") {
      w = "websites";
    } else {
      w = "unqWebsites";
    }
  });

  chrome.storage.local.get([w], function (data) {
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
    var oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    chrome.history.search(
      {
        text: "",
        maxResults: 10000,
        startTime: oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1),
      },
      function (data) {
        console.log(data);
        var websites = data.map(function (item) {
          return { url: item.url, visitCount: item.visitCount };
        });
        websites.sort(function (a, b) {
          return b.visitCount - a.visitCount;
        });
        // chrome storage local set
        chrome.storage.local.set({ websites }, function () {
          console.log(websites.slice(0, 10));
          chrome.runtime.onMessage.addListener(function (
            request,
            sender,
            sendResponse
          ) {
            if (request.message == "popup_to_background") {
              console.log(request.message);
              sendResponse({ showHistory: showHistory() });
            }
          });
        });
      }
    );
  }
});
