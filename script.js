const xhr = new XMLHttpRequest();
let response = [];

$(".btn").click(function(e) {
  // create a server request to load our book
  xhr.open("GET", "/battle", true);
  xhr.send();
  const textarea = document.getElementById("postBoard");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = xhr.response;
      console.log(typeof data);
      console.log(data);
      let newData = data.substring(2, data.length - 1);
      let finalData = newData.split(`","`);
      console.log(typeof finalData);
      console.log(finalData);

      finalData.forEach(element => {
        textarea.append(element + " \n ");
      });
      // e.preventDefault();
      textarea.scrollTop = 999999;
    }
  };
});

console.log(response);
