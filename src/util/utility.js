
/**
 *@returns {object} Returns the config object for the system
 */
export function systemConfig() 
{
    switch(game.system.id)
    {
    case "wrath-and-glory":
        return game.wng.config;
    case "age-of-sigmar-soulbound":
        return game.aos.config;
    default:
        return game[game.system.id].config;
    }
}

/**
 *
 */
export function log() 
{
    
}

/**
 * @param {string} string string to be localized
 * @returns {string} localized string
 */
export function localize(string)
{
    return game.i18n.localize(string);
}

/**
 * @param {string} string string to be localized
 * @param {object} args data for localization
 * @returns {string} localized string
 */
export function format(string, args)
{
    return game.i18n.format(string, args);
}

/**
 * Finds the first key that matches the value provided
 * @param {*} value value being test 
 * @param {*} obj object being searched
 * @param {*} options options for the search
 * @param {*} options.caseInsensitive compare value without considering case
 * @returns {string|undefined} The key found, if any
 */
export function findKey(value, obj, options = {}) 
{
    if (!value || !obj)
    {return undefined;}

    if (options.caseInsensitive) 
    {
        for (let key in obj) 
        {
            if (obj[key].toLowerCase() == value.toLowerCase())
            {return key;}
        }
    }
    else 
    {
        for (let key in obj) 
        {
            if (obj[key] == value)
            {return key;}
        }
    }
    return undefined;
}

/**
 * This function tests whether an existing ID is already present in the collection that the document is being created in
 * If there is no conflict in ID, keep the ID 
 * @param {string} id The ID being tested
 * @param {Document} document The document the id belongs to
 * @returns {boolean} whether or not to keep the id
 */
export function keepID(id, document) 
{
    try 
    {
        let compendium = !!document.pack;
        let world = !compendium;
        let collection;

        if (compendium) 
        {
            let pack = game.packs.get(document.pack);
            collection = pack.index;
        }
        else if (world)
        {collection = document.collection;}

        if (collection.has(id)) 
        {
            ui.notifications.notify(`${game.i18n.format("WH.Error.ID", {name: document.name})}`);
            return false;
        }
        else {return true;}
    }
    catch (e) 
    {
        console.error(e);
        return false;
    }
}

/**
 * Find the owner of a document, prioritizing non-GM users 
 * @param {object} document Document whose owner is being found
 * @returns {User} Owning user found
 */
export function getActiveDocumentOwner(document) 
{
    // let document = fromUuidSync(uuid);
    if (document.documentName == "Item" && document.isOwned) 
    {
        document = document.actor;
    }
    let activePlayers = game.users.contents.filter(u => u.active && u.role <= 2); // Not assistant or GM 
    let owningUser;

    // First, prioritize if any user has this document as their assigned character
    owningUser = activePlayers.find(u => u.character?.id == document.id);

    // If not found, find the first non-GM user that can update this document
    if (!owningUser) 
    {
        owningUser = activePlayers.find(u => document.testUserPermission(u, "OWNER"));
    }

    // If still no owning user, simply find the first GM
    if (!owningUser) 
    {
        owningUser = game.users.contents.filter(u => u.active).find(u => u.isGM);
    }
    
    return owningUser;
}