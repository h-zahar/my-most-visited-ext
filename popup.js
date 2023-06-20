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
    console.log(websites.slice(0, 15));
  });

  var websitesList = document.getElementById("websitesList");
  websitesList.innerHTML = "";

  websites.slice(0, 15).forEach(function (website) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.runtime.sendMessage(
    {
      message: "popup_to_background",
      // data: any_data,
    },
    (response) => {
      response.showHistory();
    }
  );
});
