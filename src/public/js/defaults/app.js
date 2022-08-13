const mobileHeaderRender = () => {
    const headerItems = document.getElementById("#header_link_items");
    const mobileMenu = document.getElementById("#mobileHeaderMenu");
    mobileMenu.addEventListener("click", () => {
        if (headerItems.classList.contains("responsiveClose")) {
            headerItems.classList.remove("responsiveClose")
            headerItems.classList.add("responsiveOpen")
        } else if (headerItems.classList.contains("responsiveOpen")) {
            headerItems.classList.remove("responsiveOpen")
            headerItems.classList.add("responsiveClose")
        } else {
            headerItems.classList.add("responsiveOpen")
        }
    })
}

const accountSubnavRender = () => {
    const accountItems = document.querySelector(".subnav_account_header");
    const accountMenu = document.querySelector(".header_account");
    accountMenu.addEventListener("click", () => {
        if (accountItems.classList.contains("menuClose")) {
            accountItems.classList.remove("menuClose")
            accountItems.classList.add("menuOpen")
        } else if (accountItems.classList.contains("menuOpen")) {
            accountItems.classList.remove("menuOpen")
            accountItems.classList.add("menuClose")
        } else {
            accountItems.classList.add("menuOpen")
        }
    })
}

mobileHeaderRender();
accountSubnavRender();