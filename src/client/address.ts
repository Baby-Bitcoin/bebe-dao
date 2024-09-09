const getAddressAvatar = (address: any) => {
  let url = "/svgs/user.svg";
  if (address.avatarUrl && address.avatarUrl != "") {
    url = "/images/addresses/" + address.avatarUrl;
  }

  return url;
};

const getAddressAvatarPostDefault = (address: any) => {
  let url = "/img/love-technology.jpg";
  if (address.avatarUrl && address.avatarUrl != "") {
    url = "/images/addresses/" + address.avatarUrl;
  }

  return url;
};

export { getAddressAvatar, getAddressAvatarPostDefault };
