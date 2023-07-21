async function ActualPage(icon, torre, pagina) {
  console.log("x");
  let html = `
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center paginaAtual">
         <img src="/meteo/icons/${icon}" class="iconsPagAtual"><span> ${torre} -&nbsp; </span><span style="color: #ff3f3f;"> ${pagina}</span>
        </a>
      </li> 
      <li class="nav-item">
        <a class=" d-flex align-items-center paginaAtual">
          <a class="icon" href="/meteo/login/login.html"><img src="/meteo/icons/icon_settings.png" class="iconsPagAtualSettings">
          </a>
        </a>
      </li> 
    `;
  return html;
}
export { ActualPage }
