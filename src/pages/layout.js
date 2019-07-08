import './layout.scss';

const showMe = document.querySelectorAll('.showMe');
for (let index = 0; index < showMe.length; index++) {
    showMe[index].addEventListener('click', e => {
        e.preventDefault();
        const block = document.querySelector(`#${showMe[index].dataset.show}`);

        if (block.classList.contains('hidden')) {
            block.classList.remove('hidden');
        }
    });
}
