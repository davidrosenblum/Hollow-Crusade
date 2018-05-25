(function(){
    var userElem = null,
        passElem = null,
        confPassElem = null,
        modalShadow = null,
        modalContainer = null,
        modalBody = null;

    var ajax = function(method, url, headers, data, callback){
        let xhr = new XMLHttpRequest();

        if(typeof callback === "function"){
            xhr.onload = callback.bind(xhr);
        }

        xhr.open(method, url, true);

        if(headers){
            for(var h in headers){
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        xhr.send(data);
    };

    var submitForm = function(evt){
        evt.preventDefault();

        var user = userElem.value,
            pass = passElem.value,
            confPass = confPassElem.value;

        if(!user || !pass || !confPass){
            modal("Please complete the form.");
            return;
        }

        if(pass !== confPass){
            modal("Passwords do not match.");
            return;
        }

        ajax(
            "POST",
            window.location.origin + "/api/accounts/create/" + user + "/" + pass,
            null,
            null,
            onAjaxResponse
        );
    };

    var onAjaxResponse = function(){
        if(this.status === 200){
            userElem.value = "";
            passElem.value = "";
            confPassElem.value = "";
            
            updatePasswordDisplay();
        }

        modal(this.response);
    };

    var updatePasswordDisplay = function(){
        if(!passElem.value || !confPassElem.value){
            passElem.style.borderColor = "";
            confPassElem.style.borderColor = "";
        }
        else if(passElem.value !== confPassElem.value){
            passElem.style.borderColor = "red";
            confPassElem.style.borderColor = "red";
        }
        else{
            passElem.style.borderColor = "green";
            confPassElem.style.borderColor = "green";
        }
    };

    var modal = function(message){
        modalShadow.style.display = "block";
        modalContainer.style.display = "block";
        modalBody.innerHTML = message;
    };

    var closeModal = function(){
        modalShadow.style.display = "none";
        modalContainer.style.display = "none";
        modalBody.innerHTML = "";
    };

    window.addEventListener("load", function(evt){
        document.querySelector("#account-form").addEventListener("submit", submitForm);

        userElem = document.querySelector("#username");
        passElem = document.querySelector("#password");
        confPassElem = document.querySelector("#confirm-password");

        passElem.addEventListener("input", updatePasswordDisplay);
        confPassElem.addEventListener("input", updatePasswordDisplay);

        modalShadow = document.querySelector("#modal-shadow");
        modalContainer = document.querySelector("#modal-container");
        modalBody = document.querySelector("#modal-body");

        document.querySelector("#modal-close-btn").addEventListener("click", closeModal);
    });
})();