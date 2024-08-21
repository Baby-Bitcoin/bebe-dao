import { $ } from "./ui.js";

const showModal = (html: string) => {
  injectModal(html);
  const modal = $("#modal");
  modal.classList.remove("hide");
};

const injectModal = (html: string) => {
  const modal = $("#modal > .modal_content");
  modal.innerHTML = html;
};

const closeModal = () => {
  injectModal("");
  const modal = $("#modal");
  modal.classList.add("hide");
};

export { showModal, injectModal, closeModal };
