import { checkFileProperties, handleUploadedFile } from "./image-select.js";
import { $, $$ } from "./ui.js";

const handlePostSubmit = async () => {
  $("#post-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    // get the number of options added and push 0 for each of them to the votes array
    let votes = [];
    const voteInputsNr = $$(".voteInput").length;
    for (let i = 0; i < voteInputsNr; i++) {
      votes.push(0);
    }

    const formData = new FormData();

    const titleElement: any = $("#title");
    const durationElement: any = $("#duration");
    const descriptionElement: any = $("#description");
    const imageElement: any = $(".image-label+input[type=file]");

    if (
      !titleElement ||
      !durationElement ||
      !descriptionElement ||
      !imageElement
    ) {
      return;
    }

    formData.append("title", titleElement.value);
    formData.append("duration", durationElement.value);
    formData.append("description", descriptionElement.value);
    formData.append("quorum", ($("#quorumSlider") as any).value);
    imageElement.files[0] && formData.append("image", imageElement.files[0]);

    $$(".voteInput").forEach((option: any) =>
      formData.append("options[]", option.value)
    );

    const tags = ($("#tags-input") as any).value;
    const punctuationless = tags
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trimStart()
      .trimEnd();
    const finalTagsString = punctuationless.replace(/\s{2,}/g, " ");

    formData.append("tags", finalTagsString);
    formData.append("type", ($('input[name="type"]:checked') as any).value);
    (votes || []).forEach((vote: string) => formData.append("votes[]", vote));

    // Sends post request to /post with all input information
    const result = await fetch("/post", {
      method: "POST",
      body: formData,
    }).then((response) => response.json());

    console.log(result);
    if (result.status === 200) {
      $(".form-container").style.display = "none";
      $("body").style.overflow = "";
      $(".shortMessage").innerHTML =
        '<div class="quickText"><h2 style="color: green">POST SENT</h2></div>';
    }
  });
};

const postFormListener = () => {
  let postType;
  let pollOptions = [];
  let imageSelected = false;

  $("#post-form").addEventListener("change", (event) => {
    postType = ($('input[name="type"]:checked') as any).value;
    pollOptions = [];
    $$(".voteInput").forEach((el: any, i) => {
      pollOptions.push(el.value);
    });

    const election =
      ($('input[name="type"]:checked') as any).value === "election";

    if (
      ($('input[name="type"]:checked') as any).value === "poll" ||
      ($('input[name="type"]:checked') as any).value === "election"
    ) {
      ($(".options") as any).style = "";
      ($("#add-remove-inputs") as any).style = "display: block";
      $$(".voteInput").forEach((el: any, i) => {
        el.required = true;
        election ? (el.placeholder = "Candidate") : (el.placeholder = "Option");
      });
    } else {
      ($(".options") as any).style = "display: none";
      ($("#add-remove-inputs") as any).style = "";
      $$(".voteInput").forEach((el: any, i) => {
        el.required = false;
      });
    }

    // check file selected
    let theFile;
    if ((event.target as any).files) {
      theFile = (event.target as any).files[0];
      $("#post-form .form_error").classList.add("error");
      if (checkFileProperties(theFile, "post-form")) {
        handleUploadedFile(theFile, "post-form");
        imageSelected = true;
      }
    }
  });

  $("#post-form .image-label+input[type=file]").addEventListener(
    "click",
    (event) => {
      $("#post-form .form_error").innerHTML = "";
      $("#post-form .form_error").classList.remove("error");
    }
  );
};

let initialized: boolean = false;
document.onreadystatechange = () => {
  if (document.readyState === "complete" && !initialized) {
    initialized = true;
    handlePostSubmit();
    postFormListener();
  }
};
