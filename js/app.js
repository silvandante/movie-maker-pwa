let deferredInstallPrompt = null;
const botaoInstalar = document.getElementById('btInstalar');

let initialiseUI = function(){

    botaoInstalar.removeAttribute('hidden');
    botaoInstalar.addEventListener('click', function(){

        deferredInstallPrompt.prompt();

        deferredInstallPrompt.userChoice.then((choice) => {

            if(choice.outcome === 'accepted'){

                console.log("Usuário aceitou a instalação");

            }else{

                console.log("Usuário não aceitou a instalação");

            }

        });

    });

}

window.addEventListener('beforeinstallprompt', gravarEvento);

function gravarEvento(evt){
    console.log("teste");
    deferredInstallPrompt = evt;
}


//Carregar produtos do servidor
var ajax = new XMLHttpRequest();

ajax.open("GET", "./data.json", true);

ajax.send();

ajax.onreadystatechange = function(){


    if(ajax.readyState == 4 && ajax.status == 200){
            var data = ajax.responseText;

            var data_json = JSON.parse(data);

            var conteudo = document.getElementById('content_result');

            if(data_json.length == 0){

                conteudo.innerHTML = '<div class="row"><div class="col-12"><div class="alert alert-danger" role="alert">Nenhum produto cadastrado!</div></div></div>';

            }else{

                var html_conteudo = "";

                html_conteudo+='<div class="container-fluid">';

                if(data_json.movies.length == 0){
                    html_conteudo+= '<div class="row"><div class="col-12"><div class="alert alert-primary" role="alert">Nenhum filme cadastrado!</div></div></div>';
                } else {
                    //Loop de filmes
                    html_conteudo+='<div class="row">';
                    for(var i=0; i < data_json.movies.length; i++){
                        html_conteudo+= card_movie(data_json.movies[i], data_json.genres);
                    }
                    html_conteudo+='</div>';
                }

                html_conteudo+='</div>';

                //Gravar a criação dos elementos
                conteudo.innerHTML = html_conteudo;
                cache_cards(data_json);
            }
        } 

}


function getReviewsForThisMovie(movieId) {
    var ajaxGetReview = new XMLHttpRequest();

    ajaxGetReview.open("GET", "https://api.themoviedb.org/3/movie/"+movieId+"/credits?api_key=4b7f32f602241c55fc0b38e3612322e6&language=pt-BR&page=1", true);

    ajaxGetReview.timeout = 2000

    ajaxGetReview.onerror = () => {
        var conteudo = document.getElementById('modal_body_'+movieId);
        var container = "<div class='row'>"
        container+="Parece que você está sem internet. Tente novamente quando estiver com conexão."
        container+="</div>"
        conteudo.innerHTML = container;

    }

    ajaxGetReview.ontimeout = () => {
        var conteudo = document.getElementById('modal_body_'+movieId);
        var container = "<div class='row'>"
        container+="Tempo esgotado. Sua internet parece estar lenta."
        container+="</div>"
        conteudo.innerHTML = container;
    }

    ajaxGetReview.send();

    ajaxGetReview.onreadystatechange = () => {

        if(ajaxGetReview.readyState == 4 && ajaxGetReview.status == 200){

            var data = ajaxGetReview.responseText;

            var data_json = JSON.parse(data);

            var conteudo = document.getElementById('modal_body_'+movieId);

            var container = "<div class='row'>"

            if(data_json.cast.length > 0) {
                for(var i = 0; i < data_json.cast.length-1; i++){
                    container+=cast_content(data_json.cast[i]);
                }
                container+="</div>"
            } else {
                container = '<div class="row"><div class="col-12"><div class="alert alert-primary" role="alert">Nenhum cast cadastrado para esse filme!</div></div></div>';
            }

            conteudo.innerHTML = container;

        }
    }

}


var card_movie = (movie, genresJson) => {
    const { 
        genre_ids, id, 
        original_language, original_title, 
        overview, release_date, 
        poster_path, title, 
        vote_average, vote_count } = movie

    var genres = ""

    genre_ids.forEach(movieGenre => {
        const foundGenre = genresJson.find(genre => genre.id == movieGenre)

        if(foundGenre!=-1)
            genres+='<span class="badge badge-secondary" style="margin-right: 5px;">'+foundGenre.name+"</span>"

    })

    return '<div class="col-lg-4 col-md-6 col-sm-12" style="margin-top:10px;">'+
        '<div class="card shadow bg-white rounded h-100">'+
            '<img src="'+poster_path+'" class="card-img-top" alt="...">'+
            '<div class="card-body">'+
                '<div style="display: flex; flex-direction: row;"><i class="fas fa-star" style="margin-top: 3px;"></i><p><strong>'+vote_average+'</strong> ('+vote_count+' votos)</p></div>'+
                '<h4>'+title+'</h4>'+
                '<i>'+original_title+'</i><br/>'+
                genres+
            '<p class="card-text">'+overview+'</p>'+
            // START MODAL
            '<div class="modal fade h-100"  id="modal_'+id+'" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'+
                '<div class="modal-dialog modal-dialog-centered">'+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+
                            '<h5 class="modal-title" id="exampleModalLabel">'+title+'</h5>'+
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                                '<span aria-hidden="true">&times;</span>'+
                            '</button>'+
                        '</div>'+
                        '<div class="modal-body" id="modal_body_'+id+'">'+
                            '<div>Carregando...</div>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            //END MODAL
            '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="getReviewsForThisMovie('+id+')" data-target="#modal_'+id+'">Ver Elento e Produção</button>'+
            '</div>'+
        '</div>'+
    '</div>';

}

var cast_content = (cast) => {

    const {
        name,
        profile_path,
        character
    } = cast;

    return '<div class="col-lg-6 col-md-6 col-sm-6" style="margin-top:10px;">'+
        '<div class="card shadow bg-white rounded h-100">'+
            '<img src="https://image.tmdb.org/t/p/w500/'+profile_path+'" class="card-img-top" alt="Imagem Indisponível">'+
            '<div class="card-body">'+
                '<h4>'+name+'</h4>'+
            '<p class="card-text">Personagem: '+character+'</p>'+
            '</div>'+
        '</div>'+
    '</div>';
}

//Cache conteúdo dinâmico
var cache_cards = function(data_json){

    if('caches' in window){

        caches.delete('movie-maker-conteudo').then(function(){

            console.log('Deletando cache de conteúdo antigo');

            if(data_json.length > 0){

                var files = ['data.json'];

                //Entrando na categoria
                for(var i = 0; i < data_json.movies.length; i++){
                    files.push(data_json.movies[i].poster_path);
                }

                caches.open('movie-maker-conteudo').then(function (cache){

                    cache.addAll(files).then(function(){
                        console.log("Arquivos de conteúdo cacheados!");
                    });

                });
            }

        });

    }
}
