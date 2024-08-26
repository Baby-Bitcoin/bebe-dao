const { $ } = require("./ui");

const showModal = (html: string) => {
  injectModal(html);
  const modal = $("#wallets");
  modal?.classList?.remove("hide");
};

const injectModal = (html: string) => {
  const modal = $("#wallets > .modal_content");
  if (modal) {
    modal.innerHTML = html;
  }
};

const closeModal = () => {
  injectModal("");
  const modal = $("#wallets");
  modal?.classList?.add("hide");
};

export { showModal, injectModal, closeModal };
