
const fs = require('fs').promises
const path = require("path")

async function doRequest(url){
    return await (await fetch(url)).json()
}

async function paginate(url,type){
    let result = []

    let latestResponse = {
        next_page:`${url}/api/v2/help_center/en-us/${type}.json?page=1&per_page=100`
    }

    while (latestResponse.next_page){
        latestResponse = await doRequest(latestResponse.next_page)
        for (let thing of latestResponse[type]){
            result.push(thing)
        }
        console.log(`[PAGINATOR] [${url}] [${type}] On page: ${latestResponse.page}`)
    }

    console.log(`[PAGINATOR] [${url}] Finished paginating, Loaded ${result.length} ${type}!`)
    return result

}

async function main(){
    /* initliaze variables */
    let normalArticles; 
    let devArticles;
    let creatorsArticles;

    let normalArticlesSections;
    let devArticlesSections;
    let creatorsArticlesSections;
    

    /* set support urls */
    const normalArticlesUrl = "https://support.discord.com"
    const devArticlesUrl = "https://support-dev.discord.com"
    const creatorsArticlesUrl = "https://creator-support.discord.com"

    /* load paginator for articles */

    normalArticles = await paginate(normalArticlesUrl,"articles")
    devArticles = await paginate(devArticlesUrl,"articles")
    creatorsArticles = await paginate(creatorsArticlesUrl,"articles")

    /* load paginator for sections */

    normalArticlesSections = await paginate(normalArticlesUrl,"sections")
    devArticlesSections = await paginate(devArticlesUrl,"sections")
    creatorsArticlesSections = await paginate(creatorsArticlesUrl,"sections")    


    console.log('[SAVER] Saving all articles')
    await fs.writeFile(".\\normal_articles.json",JSON.stringify(normalArticles,null,4),{encoding:"utf-8"})
    await fs.writeFile(".\\dev_articles.json",JSON.stringify(devArticles,null,4),{encoding:"utf-8"})
    await fs.writeFile(".\\creators_articles.json",JSON.stringify(creatorsArticles,null,4),{encoding:"utf-8"})

    for (let article of normalArticles){
        let sectionName = normalArticlesSections.find(e=>e.id === article.section_id).name
        console.log(article.title)
        console.log(sectionName)
        console.log(path.dirname(`./normal_articles\\${sectionName}\\${article.title}.md`))
        try { await fs.mkdir(`./normal_articles\\${sectionName.replaceAll("/","&")}`) } catch {}
        await fs.writeFile(`.\\normal_articles\\${sectionName.replaceAll("/","&")}\\${article.title.replaceAll("/","&")}.md`,article.body,{encoding:"utf-8"})
    }
    
    for (let article of devArticles){
        let sectionName = devArticlesSections.find(e=>e.id === article.section_id).name
        try { await fs.mkdir(`./dev_articles\\${sectionName.replaceAll("/","&")}`) } catch {}
        await fs.writeFile(`.\\dev_articles\\${sectionName.replaceAll("/","&")}\\${article.title.replaceAll("/","&")}.md`,article.body,{encoding:"utf-8"})
    }

    for (let article of creatorsArticles){
        let sectionName = creatorsArticlesSections.find(e=>e.id === article.section_id).name
        try { await fs.mkdir(`./creator_articles\\${sectionName.replaceAll("/","&")}`) } catch {}
        await fs.writeFile(`./creator_articles\\${sectionName.replaceAll("/","&")}\\${article.title.replaceAll("/","&")}.md`,article.body,{encoding:"utf-8"})
    }
    
    
}

main()