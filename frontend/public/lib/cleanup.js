setTimeout(() => {
    Array.from(document.head.children)
        .filter(child => child.localName === 'title' && child.innerText === '')
        .forEach(child => document.head.removeChild(child));
}, 500);
