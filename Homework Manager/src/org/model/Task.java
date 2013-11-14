/**
 * 
 */
package org.model;

import org.model.interfaces.AbstractTask;

/**
 * @author Tamás
 *
 */
public class Task extends AbstractTask {

	public Task() {
		this.title = null;
		this.shortDescription = null;
		this.cTask = null;
	}
	
	public Task(String title, String shortDesc) {
		this.title = title;
		this.shortDescription = shortDesc;
		this.cTask = null;
	}
	
}
