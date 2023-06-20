// chrome.storage.local.set({ state: "SITE" });

const showWeb = () => {
  let oneYearAgo = new Date();
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

      const uniqueList = websites
        .filter(
          (v, i, a) =>
            a.findIndex(
              (t) =>
                new URL(t.url).hostname.replace("www.", "") ===
                new URL(v.url).hostname.replace("www.", "")
            ) === i
        )
        .map((item) => new URL(item.url).hostname.replace("www.", ""));

      console.log("Check:", uniqueList);

      const unqWebsites = [];

      uniqueList.forEach((item) => {
        const filtered = websites.filter(
          (website) =>
            new URL(website.url).hostname.replace("www.", "") === item
        );
        const sum = filtered.reduce((a, b) => a + b.visitCount, 0);
        unqWebsites.push({ url: filtered[0].url, visitCount: sum });
      });

      console.log("unqWebsites:", unqWebsites);

      chrome.storage.local.set({ unqWebsites: unqWebsites });

      // chrome storage local set
      chrome.storage.local.set({ websites }, function () {
        console.log(websites.slice(0, 15));
      });

      var websitesList = document.getElementById("websitesList");
      websitesList.innerHTML = "";

      chrome.storage.local.get(["state"], function (data) {
        let w = [];
        if (data?.state === "PAGE") {
          w = websites;
        } else if (data?.state) {
          w = unqWebsites;
        } else {
          w = websites;
          chrome.storage.local.set({ state: "SITE" });
        }
        w.slice(0, 15).forEach(function (website) {
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
    }
  );
};

showWeb();

const category = document.getElementById("category");
const title = document.getElementById("title");

chrome.storage.local.get(["state"], function (data) {
  if (data.state === "SITE") {
    title.innerHTML = "Websites";
    category.innerHTML = "Webpage";
  } else {
    title.innerHTML = "Webpages";
    category.innerHTML = "Website";
  }
});

const btnSwitch = document.getElementById("btn-switch");

btnSwitch.addEventListener("click", () => {
  chrome.storage.local.get(["state"], function (data) {
    if (data.state === "SITE") {
      chrome.storage.local.set({ state: "PAGE" });
      title.innerHTML = "Webpages";
      category.innerHTML = "Website";
    } else {
      chrome.storage.local.set({ state: "SITE" });
      title.innerHTML = "Websites";
      category.innerHTML = "Webpage";
    }
    showWeb();
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
