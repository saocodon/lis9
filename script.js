let start = [], end = [], i = 0, j = 0, answer = '', script = [];
let rmList = ["Applause", "Laughter"];
let tickId;

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function submit() {
    clearInterval(tickId);
    document.getElementById("back").style.visibility = 'hidden';
    document.getElementById("next").style.visibility = 'hidden';
    document.getElementById("subcount").style.visibility = 'hidden';
    document.getElementById("relax").setAttribute("controls","controls")
    var work = document.getElementById("work").value;
    work = work.replace(/[.,\/#!$%\^&\*;\":{}=\-_`~()]/g, "");
    work = work.replace(/\s{2,}/g," ");
    for (let j = 0; j < rmList.length; j++) work = work.replace(rmList[j], " ");
    work = work.toLowerCase();
    document.getElementById("acc").innerHTML = "<b>Accuracy: " + (similarity(work, answer) * 100).toFixed(2).toString() + "%</b>";
    let output = htmldiff(work, answer);
    document.getElementById("output").innerHTML = output;
    // show transcript
    for (let i = 0; i < script.length; i++) {
        const para = document.createElement("p");
        const node = document.createTextNode(script[i]);
        para.appendChild(node);
        para.classList.add('sub');
        para.onclick = function() {
            document.getElementById("relax").currentTime = start[i];
        }
        const element = document.getElementById("sub");
        element.appendChild(para);
    }
}

function back() { i = i - 1; document.getElementById("subcount").innerHTML = (i + 1).toString() + '/' + script.length; }
function next() { i = i + 1; document.getElementById("subcount").innerHTML = (i + 1).toString() + '/' + script.length;}

function tick() {
    if (document.getElementById("relax").currentTime >= end[i]) {
    //    document.getElementById("relax").src = "https://www.youtube.com/embed/" + document.getElementById("videoID").value + "?autoplay=1&controls=0&t=" + start[i] + "s";
        document.getElementById("relax").currentTime = start[i];
    }
    var backBtn = document.getElementById("back"), nextBtn = document.getElementById("next");
    if (i == 0) { backBtn.disabled = true; } else { backBtn.disabled = false; }
    if (i >= start.length) { nextBtn.disabled = true; } else { nextBtn.disabled = false; }
}

function loadSes() {
    tickId = setInterval(tick, 125);
    //document.getElementById("relax").src = "https://www.youtube.com/embed/" + document.getElementById("videoID").value + "?autoplay=1&controls=0";
    var vidFile = document.getElementById("vidFile").files[0];
    var fileURL = URL.createObjectURL(vidFile);
    //document.getElementById("relax").src = "https://www.youtube.com/embed/" + document.getElementById("videoID").value + "?autoplay=1&controls=0";
    document.getElementById("relax").src = fileURL;
    //var vidID = document.getElementById("videoID");
    var subFile = document.getElementById("subFile").files[0];
    var reader = new FileReader();
    reader.readAsText(subFile, "UTF-8");
    reader.onload = function (evt) {
        var text = evt.target.result;
        lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (lines[i - 1] == "" || lines[i] == "1") {
                // Get timestamps at lines[i + 1]
                time = lines[i + 1].split(" --> ");
                start_num = time[0].slice(0, -4).split(':');
                stop_num = time[1].slice(0, -4).split(':');
                start_sec = parseInt(start_num[0]) * 3600 + parseInt(start_num[1]) * 60 + parseInt(start_num[2]);
                stop_sec = parseInt(stop_num[0]) * 3600 + parseInt(stop_num[1]) * 60 + parseInt(stop_num[2]);
                start.push(start_sec)
                end.push(stop_sec)
                // Get subtitle
                script.push("");
                for (let j = i + 2; j < lines.length; j++) {
                    if (lines[j] == "") break;
                    answer = answer + ' ' + lines[j];
                    script[script.length - 1] = script[script.length - 1] + lines[j];
                }
            }
            answer = answer.replace(/[.,\/#!$%\^&\*;\":{}=\-_`~()]/g, "");
            answer = answer.replace(/\s{2,}/g," ");
            for (let j = 0; j < rmList.length; j++) answer = answer.replace(rmList[j], " ");
            answer = answer.toLowerCase();
            document.getElementById("subcount").innerHTML = "1/" + script.length;
        }
    }
}
