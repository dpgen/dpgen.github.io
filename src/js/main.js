$(function () {
  function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined
          ? null
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return null;
  }

  function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
  }

  function createErrorHtml() {
    return `
      <section class="error">
        <p class="big-note" style="text-align: center;">You have to register first to generate a DP!</p>
        <p class="small-note" style="text-align: center;">
          Click <a href="https://events.egfm.org/">here</a> to register.
        </p>
      </section>
    `;
  }
  function DifferenceInDays(firstDate, secondDate) {
    return Math.ceil((secondDate - firstDate) / (1000 * 60 * 60 * 24));
  }

  /* global variables */
  const today = new Date();
  const eventDate = new Date("2020/08/09");
  const daysToGo = DifferenceInDays(today, eventDate);
  const button = $(".create-dp");
  const fileInput = $("input[type=file]");
  const preview = $("img");
  const changebtn = $(".change");
  const deletebtn = $(".delete");
  const fileInpbtn = $(".fileinput-button");
  const main = $("main");
  const mainContent = main.innerHTML;

  var queryName = getUrlParameter("name");
  var requestKey = getUrlParameter("requestKey");
  if (isEmptyOrSpaces(queryName) || isEmptyOrSpaces(requestKey)) {
    main.css("display", "flex");
    main.html(createErrorHtml());
  } else {
    queryName.trim();
    if (queryName.length <= 15) {
      $("#fullname").val(queryName);
    } else {
      $("#fullname").val("");
    }
    main.css("display", "flex");
  }

  $(".image-editor").cropit();

  $("form").submit(function (e) {
    e.preventDefault();
    var username = $("#fullname").val();
    // Move cropped image data to hidden input
    var imageData = $(".image-editor").cropit("export", {
      type: "image/jpeg",
      quality: 1.0,
      originalSize: true,
    });
    $(".hidden-image-data").val(imageData);

    button.attr("disabled", "disabled").html("...processing");

    // x, y, width, height
    const picData = [301.8, 197.1, 471.1, 507.6];
    // name, y, x
    const nameData = [username, 826, 40];

    createDP(username, imageData, picData, nameData, function (url) {
      navigateTo("yourdp", createHTMLForImage(url));

      function createHTMLForImage(url) {
        var headerText = document.getElementById("header-text");
        headerText.innerHTML = "";
        return `
          <section class="dp-container">
            <a href="?name=${queryName}&requestKey=${requestKey}" class="arrow-back"><i class="ti-arrow-left"></i> Back</a>
            <div class="img-dp">
              <img id="dp_result" src=${url} title="Your DP"/>
              <br>
              <a id="asd" class="download-dp">Download Image</a>
              <br>
            </div>
            
              <p class="share">Don't forget to share the good news</p>
            
           <!-- <div class="social-media-handles">
              <div>
                <a href="www.facebook.com"><p>Facebook</p></a>
              </div>
              <div>
                <a href="www.instagram.com"><p>Instagram</p></a>
              </div>
              <div>
                <a href="www.twitter.com"><p>Twitter</p></a>
              </div>
            </div> -->
            <script>
              document.getElementById('asd').onclick = function name() {
                downloadImage("${url}", "BECON_DP_${username}");
              }
              function downloadImage(inUrl, inName) {
                console.log("reached");
               var w = window.open("");
               var link = w.document.createElement("a");
               link.download = inName;
               link.href = inUrl;
               link.click();
               location.replace("https://egfm.org/becon")
              }
            </script>
          </section>
        `;
      }
    });
  });
  /* file input */
  fileInput.on("change", function (e) {
    fileInpbtn.css({ display: "none" });
    changebtn.css({ display: "inline-block" });
    deletebtn.css({ display: "inline-block" });
  });

  /* change image btn */
  changebtn.on("click", function () {
    fileInput.click();
  });

  /* remove image btn */
  deletebtn.on("click", function () {
    let file = document.querySelector("input[type=file]").files[0];
    file.value = null;

    fileInpbtn.css({ display: "inline-block" });
    changebtn.css({ display: "none" });
    deletebtn.css({ display: "none" });

    $(".cropit-preview-image").attr("src", "");
  });

  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || "";
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  if (CanvasRenderingContext2D && !CanvasRenderingContext2D.renderText) {
    // @param  letterSpacing  {float}  CSS letter-spacing property
    CanvasRenderingContext2D.prototype.renderText = function (
      text,
      x,
      y,
      letterSpacing
    ) {
      if (!text || typeof text !== "string" || text.length === 0) {
        return;
      }

      if (typeof letterSpacing === "undefined") {
        letterSpacing = 0;
      }

      // letterSpacing of 0 means normal letter-spacing

      var characters = String.prototype.split.call(text, ""),
        index = 0,
        current,
        currentPosition = x,
        align = 1;

      if (this.textAlign === "right") {
        characters = characters.reverse();
        align = -1;
      } else if (this.textAlign === "center") {
        var totalWidth = 0;
        for (var i = 0; i < characters.length; i++) {
          totalWidth += this.measureText(characters[i]).width + letterSpacing;
        }
        currentPosition = x - totalWidth / 2;
      }

      while (index < text.length) {
        current = characters[index++];
        this.fillText(current, currentPosition, y);
        currentPosition +=
          align * (this.measureText(current).width + letterSpacing);
      }
    };
  }

  function createDP(username, imageUrl, pic, name, cb) {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d"),
      imageCount = 2,
      view = {
        x: pic[0],
        y: pic[1],
        width: pic[2],
        height: pic[3],
      },
      innerText = {
        x: view.width * 0.7,
        y: view.height - 80,
      };

    var userImg = loadImage(imageUrl);
    var frameImg = loadImage("./src/img/firstFrame.jpg");

    function loadImage(src) {
      var img = new Image();
      img.onload = transformImage;
      img.src = src;
      return img;
    }

    function transformImage() {
      if (--imageCount !== 0) return;

      canvas.width = frameImg.width;
      canvas.height = frameImg.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(frameImg, 0, 0);

      ctx.drawImage(userImg, view.x, view.y, view.width, view.height);

      ctx = canvas.getContext("2d");

      //Write user name
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.font = "40px Montserrat-Bold";
      ctx.fillStyle = "#ffffff";
      var canvasText = name[0];
      ctx.renderText(canvasText, name[2], name[1]);

      //Write Days to go
      ctx.font = "50px Montserrat-Bold";
      ctx.fillStyle = "#f5f5f5";
      if (daysToGo == 1) {
        canvasText = "1 day";
      } else {
        canvasText = `${daysToGo} days`;
      }
      ctx.renderText(canvasText, 67, 62, -0.25);
      canvasText = "to go!";
      ctx.renderText(canvasText, 81, 102, -0.25);

      cb(canvas.toDataURL("image/jpeg", 1.0));
    }
  }

  function navigateTo(view, temp = "") {
    switch (view) {
      case "yourdp":
        main.html(temp);
        main.css({ background: "none" });
        break;
      default:
        main.style.background = "rgb(108, 86, 123)";
        main.innerHTML = mainContent;
    }
  }
  console.log("DOM fully loaded and parsed");
});
