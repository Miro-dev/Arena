// const url = "/battle";

// $(".btn").click(function(e) {
//   $.get(url, function(data, status) {
//     console.log(data);
//     document.getElementById("postBoard").append(data);
//   });
//   e.preventDefault();
// });

$(".btn").click(function(e) {
  const textarea = document.getElementById("postBoard");
  $.getJSON("/battle", function(data) {
    console.log(data);

    data.forEach(element => {
      textarea.append(element + "\n");
    });

    // data.logArray.forEach(element => {
    //   textarea.append(element + "\n");
    // });
  });

  e.preventDefault();
  textarea.scrollBottom;
});
