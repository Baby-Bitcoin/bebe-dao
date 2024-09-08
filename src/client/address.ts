const getAddressAvatar = (address: any) => {
  let url = "/svgs/user.svg";
  if (address.avatarUrl && address.avatarUrl != "") {
    url = "/images/addresses/" + address.avatarUrl;
  }

  return url;
};

export { getAddressAvatar };
