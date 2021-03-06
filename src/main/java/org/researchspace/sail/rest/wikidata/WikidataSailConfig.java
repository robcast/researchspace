/**
 * ResearchSpace
 * Copyright (C) 2020, © Trustees of the British Museum
 * Copyright (C) 2015-2019, metaphacts GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.researchspace.sail.rest.wikidata;

import org.researchspace.sail.rest.AbstractServiceWrappingSailConfig;

/**
 * {@link SailImplConfig} for the {@link WikidataSail} text search API.
 * 
 * @author Andriy Nikolov <an@metaphacts.com>
 *
 */
public class WikidataSailConfig extends AbstractServiceWrappingSailConfig {

    public static final String DEFAULT_URL = "https://www.wikidata.org/w/api.php";

    public WikidataSailConfig() {
        super(WikidataSailFactory.SAIL_TYPE);
        this.setUrl(DEFAULT_URL);
    }

    public WikidataSailConfig(String url) {
        super(WikidataSailFactory.SAIL_TYPE);
        this.setUrl(url);
    }

}