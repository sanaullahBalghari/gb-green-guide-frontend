const slugify = (text) => {
    let fixedText =  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    return fixedText;
}
export {
    slugify
}