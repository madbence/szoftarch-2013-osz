/**
 * 
 */
package org.model;

import org.model.interfaces.AbstractSolution;

/**
 * @author Tamás
 *
 */
public class Solution extends AbstractSolution {

	public Solution() {
		this.title = null;
		this.file = null;
		this.grade = 0;
		this.comment = null;
	}
	
	public Solution(String title) {
		this.title = title;
		this.file = null;
		this.grade = 0;
		this.comment = null;
	}
	
}
