import { $ } from "./ui.js";
const showModal = (html) => {
    injectModal(html);
    const modal = $("#wallets");
    modal.classList.remove("hide");
};
const injectModal = (html) => {
    const modal = $("#wallets > .modal_content");
    modal.innerHTML = html;
};
const closeModal = () => {
    injectModal("");
    const modal = $("#wallets");
    modal.classList.add("hide");
};
export { showModal, injectModal, closeModal };
//# sourceMappingURL=modal.js.map